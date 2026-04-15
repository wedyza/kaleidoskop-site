from typing import Union
from api.models import Category, Item
from repositories.category_repository import CategoryRepository
from django.db.models import QuerySet
from django.core.cache import cache
from uuid import UUID

class CategoryService:
    _category_repository = CategoryRepository()

    def get_items_of_category(self, pk: UUID) -> Union[QuerySet, list[Item]]:
        return self._category_repository.get_items_of_category(pk=pk)

    def find_by_id(self, pk: UUID) -> Category:
        return self._category_repository.get_category_by_pk(pk)

    def count_category_items(self, pk: UUID) -> int:
        return len(self._category_repository.get_items_of_category(pk=pk))