from services.rabbitmq import RabbitMQ
from exceptions.exceptions import NotFoundException
from api.models import Banner
from admin_panel.serializers import BannerSerializer
from services.banner_service import BannerService
from typing import Iterable
from services.redis_service import RedisService

class AdminService:
    _rq = RabbitMQ()
    _r = RedisService.initialize()
    _banner_service = BannerService()
    
    def link_telegram(self, code: str) -> str:
        chat_id = self._r.get(code)

        if chat_id is None:
            raise NotFoundException
        try:
            self._rq.publish(action="new_session", message=f"{chat_id}")
        except Exception as e:
            print("Ошибка отправки сообщения с chat_id", e)
        finally:
            self._rq.close()
            
        return chat_id
    
    
    def save_banner_group(self, data: dict, banner_group: Banner.BannerGroupType) -> list[Banner]:
        banners = []
        
        for item in data:
            banner = item['id']
            if banner.group_type == banner_group:
                banner.queue = item['queue']
                banner.save()
                banners.append(banner)
        return banners
    
    
    def upload_banner(self, serializer: BannerSerializer, group: Banner.BannerGroupType):
        max_queue = self._banner_service.get_max_queue(group)
        serializer.save(group_type=group, queue=max_queue + 1)
        return serializer
    
    
    def get_admin_queryset(self, group: Banner.BannerGroupType) -> Iterable[Banner]:
        return self._banner_service.get_admin_queryset(group)
