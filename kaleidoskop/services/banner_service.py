from api.models import Banner
from repositories.banner_repository import BannerRepository
from typing import Union
from django.db.models import QuerySet

class BannerService:
    _banner_repository = BannerRepository()
    
    def get_public_queryset(self, group_type: Banner.BannerGroupType) -> Union[QuerySet, list[Banner]]:
        return self._banner_repository.get_public_queryset(group_type)
    
    def get_max_queue(self, group_type: Banner.BannerGroupType) -> int:
        q = self._banner_repository.get_max_queue(group_type)
        if q is None:
            return 0
        return q.queue
    
    def get_admin_queryset(self, group_type: Banner.BannerGroupType) -> Union[QuerySet, list[Banner]]:
        return self._banner_repository.get_admin_queryset(group_type)
