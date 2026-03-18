from api.models import Brand, Item
from uuid import UUID
from typing import List, Union
from django.db.models import QuerySet

class BrandRepository:
    def get_brands_of_ids(self, ids: List[UUID]) -> Union[QuerySet, list[Brand]]:
        return Brand.objects.filter(id__in=ids).all()
    
    def get_brands_from_items_queryset(self, items: Union[QuerySet, list[Item]]) -> Union[QuerySet, list[Brand]]:
        ids = list(items.exclude(brand=None).values_list('brand_id', flat=True).distinct())
        return self.get_brands_of_ids(ids)