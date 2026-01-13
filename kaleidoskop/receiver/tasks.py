import time
from celery import shared_task
from api.models import Category, Item
from .serializers import NomenclatureCreateSerializer
from users.tasks import multitasker
import httpx

@multitasker
@shared_task
def parse_nomenclatures(json: dict):
    nomenclatures = NomenclatureCreateSerializer(data=json)
    if nomenclatures.is_valid():
        nomenclatures.save()
        return True
    print(nomenclatures.errors)
    return False
