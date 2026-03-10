import json
from typing import Iterable
from uuid import UUID
from services.redis_service import RedisService
from services.category_service import CategoryService
from services.item_service import ItemService
from repositories.brand_repository import BrandRepository
from redis import StrictRedis
from api.models import Brand

class BrandService:
    _category_service = CategoryService()
    _brand_repository = BrandRepository()
    _item_service = ItemService()
    _r: StrictRedis = RedisService.initialize()
    
    def get_queryset(self, category_pk: UUID) -> Iterable[Brand]:
        items = self._category_service.get_items_of_category(category_pk)
        flat_list = items.values_list("brand_id", flat=True).distinct()
        return self._brand_repository.get_brands_of_items(flat_list)

    
    def get_queryset_of_search_query(self, query: str) -> Iterable[Brand] | None:
        query_hash = str(hash(query))
        redis_object = self._r.get(query_hash)
        if redis_object is None:
            return []
        return self._brand_repository.get_brands_of_items(json.loads(redis_object))
