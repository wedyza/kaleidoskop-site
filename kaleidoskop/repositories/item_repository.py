from typing import Iterable
from api.models import Item, Nomenclature
from repositories.category_repository import CategoryRepository
from uuid import UUID

class ItemRepository:
    def get_item_by_id(self, id: UUID) -> Item:
        return Item.objects.get(id=id)
    
    def create_new_items(self, data: dict[str, str]) -> bool:
        """
        Создает не существующие в бд записи товаров
        """
        new_items = [Item(**item) for item in data]
        created = Item.objects.bulk_create(new_items, ignore_conflicts=True)
        return len(created) != 0
    
    def fillup_items_with_parents():
        """
        Заполняет значения предметов и их номенклатур
        """
        items = Item.objects.exclude(parent_code=None).filter(nomenclature=None).all()
        c = 0
        for item in items:
            c += 1
            try:
                item.nomenclature = Nomenclature.objects.get(code=item.parent_code)
            except:  # noqa: E722
                continue
        Item.objects.bulk_update(items, fields=["nomenclature"], batch_size=1000)