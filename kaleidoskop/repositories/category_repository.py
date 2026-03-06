from typing import Iterable
from api.models import Item, Category, Nomenclature
from services.nomenclature_service import NomenclatureService
from uuid import UUID

class CategoryRepository:
    __nomenclature_service = NomenclatureService()
    
    def get_category_by_id(self, id: UUID) -> Category:
        return Category.objects.get(id=id)

    def __get_base_nomenclatures(self, category: Category) -> Iterable[Nomenclature]:
        daughter_categories = category.daughter.all()
        base_nomenclatures = category.nomenclatures.all()
        for daughter in daughter_categories:
            base_nomenclatures |= daughter.nomenclatures.all()
        return base_nomenclatures

    def get_items_of_category(self, category_pk: UUID) -> Iterable[Item]:
        category = self.get_category_by_id(category_pk)
        base_nomenclatures = self.__get_base_nomenclatures(category)
        nomenclatures = self.__nomenclature_service.get_daughter_nomenclatures(base_nomenclatures)
        return Item.objects.filter(nomenclature__in=nomenclatures)