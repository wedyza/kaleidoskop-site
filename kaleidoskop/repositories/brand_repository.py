from api.models import Brand, Item
from uuid import UUID
from typing import Iterable, List

class BrandRepository:
    def get_brands_of_items(self, ids: List[UUID]) -> Iterable[Brand]:
        return Brand.objects.filter(id__in=ids).all()