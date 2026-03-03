from typing import Iterable
from api.models import Item
from repositories.category_repository import CategoryRepository
from uuid import UUID

class ItemRepository:
    def get_item_by_id(id: UUID) -> Item:
        return Item.objects.get(id=id)
    
    