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
    
    @multitasker
    @shared_task
    def produce_tg_notification(self, order_data):
        try:
            self._rq.publish(action="new_order", message=json.dumps(order_data, ensure_ascii=False))
        except Exception as e:
            print('Ошибка отправки уведомления', e)
        finally:
            self._rq.close()
            
    @multitasker
    @shared_task
    def train_content_based_model():
        all_items = Item.objects.all()
        serializer = ItemToAIModel(all_items, many=True)
        try:
            response = httpx.post(
                url=f"http://{settings.RECOMENDATIONS_URL}/train/content", json=serializer.data, timeout=0.5
            )
            print(response)
        except httpx.TimeoutException:
            print("Началось обучение")