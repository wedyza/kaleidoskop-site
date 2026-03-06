from api.models import Banner
from repositories.banner_repository import BannerRepository
from typing import Iterable

class BannerService:
    __banner_repository = BannerRepository()
    
    def get_public_queryset(self, group_type: Banner.BannerGroupType):
        return self.__banner_repository.get_public_queryset(group_type)
    
    def get_max_queue(self, group_type: Banner.BannerGroupType) -> int:
        return self.__banner_repository.get_max_queue().queue
    
    def get_admin_queryset(self, group_type: Banner.BannerGroupType) -> Iterable[Banner]:
        return Banner.objects.filter(group_type=group_type).order_by('queue').all()