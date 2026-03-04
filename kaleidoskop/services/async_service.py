from services.integration_service import multitasker
from celery import shared_task
from services.rabbitmq import RabbitMQ
import json

class AsyncService:
    rq = RabbitMQ()
    
    @multitasker
    @shared_task
    def produce_tg_notification(self, order_data):
        try:
            self.rq.publish(action="new_order", message=json.dumps(order_data, ensure_ascii=False))
        except Exception as e:
            print('Ошибка отрпавки уведомления')
        finally:
            self.rq.close()