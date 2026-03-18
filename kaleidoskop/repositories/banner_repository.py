from api.models import Banner
from django.db.models import QuerySet
from typing import Union

class BannerRepository:
    def get_public_queryset(self, group_type: Banner.BannerGroupType) -> Union[QuerySet, list[Banner]]:
        return Banner.objects.filter(group_type=group_type).filter(active=True).order_by('queue').all()
    
    def get_max_queue(self, group_type: Banner.BannerGroupType) -> Banner:
        return Banner.objects.filter(group_type=group_type).order_by('-queue').first()
    
    def get_admin_queryset(self, group_type: Banner.BannerGroupType) -> Union[QuerySet, list[Banner]]:
        return Banner.objects.filter(group_type=group_type).order_by('queue').all()
