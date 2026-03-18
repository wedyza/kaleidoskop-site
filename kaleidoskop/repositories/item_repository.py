from typing import Iterable
from django.contrib.postgres.search import SearchVector, TrigramSimilarity, TrigramDistance
from search.functions import Unaccent
from django.db.models.functions import Lower
from django.db.models import Value, Q, F
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
        
    def get_items_from_ids(self, ids: list[UUID]) -> Iterable[Item]:
        return Item.objects.filter(id__in=ids).all()


    def search_items_by_query(self, query: str) -> Iterable[Item]:
        """
        Выполняет поиск по индексу при помощи триграммной схожести (тут префиксной из-за <%). Т.е. больше имеет влияние начало названия, чем остальное (в нашем случае подходит).
        Если будут жалобы, то можно будет использовать полнотекстовой поиск при помощи SearchVector, заранее сформировав их для всех товаров, а далее уже расширять и .distinct весь queryset
        """
        normalized_query = query.lower()
        qs = Item.objects.extra(
            where=['lower(%s) <%% lower(title)'],
            params=[query]
        ).annotate(
            similarity=TrigramSimilarity(
                Value(normalized_query),
                Lower('title')
            )
        ).order_by('-similarity')
        return qs
