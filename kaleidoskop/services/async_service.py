from recomendation_system.serializers import ItemToAIModel
from api.models import Item
from services.integration_service import multitasker
from celery import shared_task
from services.rabbitmq import RabbitMQ
import json
import httpx
from django.conf import settings

class AsyncService:
    _rq = RabbitMQ()
    
    @staticmethod
    @multitasker
    @shared_task
    def produce_tg_notification(order_data):
        try:
            AsyncService._rq.publish(action="new_order", message=json.dumps(order_data, ensure_ascii=False))
        except Exception as e:
            print('Ошибка отправки уведомления', e)
        finally:
            AsyncService._rq.close()
