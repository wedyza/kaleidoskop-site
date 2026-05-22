from api.models import Item
from api.decorators import multitasker
from celery import shared_task
from services.rabbitmq import RabbitMQ
import json
from api.utils import slugify
from django.db import transaction
from api.functions import compress_image
from api.models import Item, ItemImage
from django.core.files.base import ContentFile


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

    @staticmethod
    @multitasker
    @shared_task
    @transaction.atomic
    def compress_images_for_items():
        iimages = ItemImage.objects.all()
        for image in iimages:
            if not image.source:
                continue

            with image.source.open('rb') as f: 
                original_bytes = f.read()
            content_file = ContentFile(original_bytes, name=image.source.name.removeprefix('media/'))
            compressed_image = compress_image(content_file)
            
            image.source.delete()
            image.source.save(compressed_image.name, compressed_image, save=False)
            image.save()
