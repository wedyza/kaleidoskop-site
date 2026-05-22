from django.core.management.base import BaseCommand
from services.async_service import AsyncService

class Command(BaseCommand):
    help = "Сжимает существующие изображения"
    
    def handle(self, *args, **options): # Выполнять только в случае, если в системе не сжатые изображение
        AsyncService.compress_images_for_items()