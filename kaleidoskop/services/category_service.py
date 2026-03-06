from typing import Iterable
from api.models import Category, Item
from repositories.category_repository import CategoryRepository
from uuid import UUID

class CategoryService:
    __category_repository = CategoryRepository()

    def get_items_of_category(self, pk: UUID) -> Iterable[Item]:
        return self.__category_repository.get_items_of_category(pk)

    def find_by_id(self, pk: UUID) -> Category:
        return self.__category_repository.get_category_by_id(pk)