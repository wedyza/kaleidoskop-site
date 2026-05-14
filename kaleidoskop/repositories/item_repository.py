from typing import List, Union
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models.functions import Lower
from django.db.models import QuerySet, Value, F, Case, When, Sum
from django.db import models
from api.models import Category, Item, Nomenclature, NomenclatureCategory
from api.decorators import cache_queryset
from uuid import UUID
from exceptions.exceptions import NotFoundException

class ItemRepository:
    def get_item_by_id(self, id: UUID) -> Item:
        return Item.objects.get(id=id)
    
    def create_new_items(self, data: list) -> bool:
        """
        Создает не существующие в бд записи товаров
        """
        new_items = [Item(**item) for item in data]
        created = Item.objects.bulk_create(new_items, ignore_conflicts=True)
        return len(created) != 0
    
    def fillup_items_with_parents(self):
        """
        Заполняет значения товаров и их номенклатур
        """
        items = Item.objects.exclude(parent_code=None)
        for item in items:
            try:
                item.nomenclature = Nomenclature.objects.get(code=item.parent_code)
            except:  # noqa: E722
                continue
        Item.objects.bulk_update(items, fields=["nomenclature"], batch_size=1000)
        
    
    def clearout_items_from_nomenclatures(self):
        items = Item.objects.all()
        items.update(nomenclature=None)
        Item.objects.bulk_update(items, fields=["nomenclature"], batch_size=1000)
    
        
    def find_by_ids(self, ids: list[str]) -> Union[QuerySet, List[Item]]:
        return Item.objects.filter(id__in=ids).all()


    def find_by_query(self, query: str) -> Union[QuerySet, List[Item]]:
        """
        Выполняет поиск по индексу при помощи триграммной схожести (тут префиксной из-за <%)
        и search_vector (<- Имеет больший приоритет)
        """
        normalized_query = query.lower()
        qs = Item.objects.extra(
            where=['search_vector @@ plainto_tsquery(%s)::tsquery OR %s <%% lower(title)'],
            params=[normalized_query, normalized_query]
        ).annotate(
        full_text_match=Case(
            When(search_vector=query, then=Value(1)),
            default=Value(0),
            output_field=models.IntegerField()
        ),
        trigram_similarity=TrigramSimilarity(
            Value(query.lower()),
            Lower('title')
        ),
        priority_score=Case(
            When(full_text_match=1, then=Value(2)),
            default=F('trigram_similarity'),
            output_field=models.FloatField()
        )).order_by('-priority_score', '-trigram_similarity')
        return qs


    def get_recommended_items_by_item_title(self, item: Item) -> Union[QuerySet, list[Item]]:
        """
        Рекомендации на основе триграмм
        """
        
        qs = Item.objects.extra(
            where=['lower(%s) %% lower(title)'],
            params=[item.title]
        ).annotate(
            similarity=TrigramSimilarity(Value(item.title.lower()), Lower('title'))
        ).exclude(pk=item.pk).order_by('-similarity')[:50] # Может потом еще поменять
        return qs

    @cache_queryset('item_remains')
    def get_item_remains(self, pk: UUID) -> int:
        s = Item.objects.get(pk=pk).remains.aggregate(Sum('count'))['count__sum']
        if s:
            return s
        return 0
    
    def find_by_slug(self, slug: str) -> Item:
        item = Item.objects.filter(slug=slug).first()
        if item is None:
            raise NotFoundException
        return item

    
    def find_subcategory(self, item_id: UUID) -> Category | None:
        item = self.get_item_by_id(item_id)
        links = NomenclatureCategory.objects.filter(nomenclature=item.nomenclature).first()
        if links:
            return links.category
        return None