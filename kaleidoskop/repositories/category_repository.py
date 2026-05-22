from typing import Union
from api.models import Item, Category, Nomenclature, NomenclatureCategory
from exceptions.exceptions import NotFoundException
from api.enums import CacheKeyType
from services.nomenclature_service import NomenclatureService
from django.db.models import QuerySet, Prefetch
from uuid import UUID
from api.decorators import cache_queryset

class CategoryRepository:
    _nomenclature_service = NomenclatureService()
    
    def get_category_by_pk(self, pk: UUID) -> Category:
        return Category.objects.get(pk=pk)

    def __get_base_nomenclatures(self, category: Category) -> Union[QuerySet, list[Nomenclature]]:
        daughter_categories = Category.objects.prefetch_related(
            Prefetch(
                "nomenclatures",
                Nomenclature.objects.all(),
                to_attr="category_nomenclatures"
            )
        ).filter(parent=category)
        base_nomenclatures = list(category.nomenclatures.all())
        for daughter in daughter_categories:
            base_nomenclatures.extend(daughter.category_nomenclatures)
        return base_nomenclatures

    @cache_queryset(cache_key='items_of_category', model=NomenclatureCategory)
    def get_items_of_category(self, pk: UUID) -> Union[QuerySet, list[Item]]:
        category = self.get_category_by_pk(pk)
        base_nomenclatures = self.__get_base_nomenclatures(category)
        nomenclatures = self._nomenclature_service.get_daughter_nomenclatures(base_nomenclatures)
        return Item.objects.filter(nomenclature__in=nomenclatures)

    def find_by_slug(self, slug: str) -> Category:
        category = Category.objects.filter(slug=slug).first()
        if category is None:
            raise NotFoundException
        return category

    @cache_queryset(cache_key_type=CacheKeyType.RAW, TTL=120 * 60, model=Category)
    def get_all_categories(self) -> QuerySet:
        return Category.objects.filter(active=True).all()