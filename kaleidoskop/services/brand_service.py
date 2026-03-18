import json
from typing import Union
from uuid import UUID
from services.redis_service import RedisService
from services.category_service import CategoryService
from services.item_service import ItemService
from repositories.brand_repository import BrandRepository
from redis import StrictRedis
from api.models import Brand
from django.db.models import QuerySet

class BrandService:
    _category_service = CategoryService()
    _brand_repository = BrandRepository()
    _item_service = ItemService()
    _r: StrictRedis = RedisService.initialize()
    
    def get_queryset(self, category_pk: UUID) -> Union[QuerySet, list[Brand]]:
        items = self._category_service.get_items_of_category(category_pk)
        return self._brand_repository.get_brands_from_items_queryset(items)

    
    def get_queryset_of_search_query(self, query: str) -> Union[QuerySet, list[Brand]]:
        items = self._item_service.get_items_queryset_by_query(query)
        return self._brand_repository.get_brands_from_items_queryset(items)
