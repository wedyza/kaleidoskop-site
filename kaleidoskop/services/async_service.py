from api.models import Item
from api.decorators import multitasker
from celery import shared_task
from services.rabbitmq import RabbitMQ
import json
from api.utils import slugify
from django.db import transaction
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

    @staticmethod
    @multitasker
    @shared_task
    @transaction.atomic
    def build_slugs_for_items():
        items = Item.objects.all()
        done = set()
        
        for item in items:
            count = 0
            base_slug = slugify(item.title)
            slug = base_slug
            while slug in done:
                count += 1
                slug = f"{base_slug}-{count}"
            item.slug = slug
            done.add(slug)
            item.save()
