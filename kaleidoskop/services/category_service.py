from typing import Union
from api.models import Category, Item
from repositories.category_repository import CategoryRepository
from django.db.models import QuerySet
from uuid import UUID

class CategoryService:
    _category_repository = CategoryRepository()

    def get_items_of_category(self, pk: UUID) -> Union[QuerySet, list[Item]]:
        return self._category_repository.get_items_of_category(pk)

    def find_by_id(self, pk: UUID) -> Category:
        return self._category_repository.get_category_by_id(pk)