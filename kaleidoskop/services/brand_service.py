from uuid import UUID
from services.category_service import CategoryService
from repositories.brand_repository import BrandRepository

class BrandService:
    __category_service = CategoryService()
    __brand_repository = BrandRepository()
    
    def get_queryset(self, category_pk: UUID):
        items = self.__category_service.get_items_of_category(category_pk)
        return self.__brand_repository.get_brands_of_items(items.values_list("brand_id", flat=True).distinct())