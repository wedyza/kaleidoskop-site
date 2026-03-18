from typing import List, Union
from django.contrib.postgres.search import TrigramSimilarity
from django.db.models.functions import Lower
from django.db.models import QuerySet, Value, F, Case, When
from django.db import models
from api.models import Item, Nomenclature
from uuid import UUID

class ItemRepository:
    # _vector = SearchVector(Unaccent(Lower('title')), weight='A')

    def get_item_by_id(self, id: UUID) -> Item:
        return Item.objects.get(id=id)
    
    def create_new_items(self, data: dict[str, str]) -> bool:
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
        items = Item.objects.exclude(parent_code=None).filter(nomenclature=None).all()
        for item in items:
            try:
                item.nomenclature = Nomenclature.objects.get(code=item.parent_code)
            except:  # noqa: E722
                continue
        Item.objects.bulk_update(items, fields=["nomenclature"], batch_size=1000)
        
    def get_items_from_ids(self, ids: list[UUID]) -> Union[QuerySet, List[Item]]:
        return Item.objects.filter(id__in=ids).all()


    def search_items_by_query(self, query: str) -> Union[QuerySet, List[Item]]:
        """
        Выполняет поиск по индексу при помощи триграммной схожести (тут префиксной из-за <%). Т.е. больше имеет влияние начало названия, чем остальное (в нашем случае подходит).
        Если будут жалобы, то можно будет использовать полнотекстовой поиск при помощи SearchVector, заранее сформировав их для всех товаров, а далее уже расширять и .distinct весь queryset
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
