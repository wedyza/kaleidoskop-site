from api.models import Banner
from repositories.banner_repository import BannerRepository

class BannerService:
    __banner_repository = BannerRepository()
    
    def get_public_queryset(self, group_type: Banner.BannerGroupType):
        return self.__banner_repository.get_public_queryset(group_type)