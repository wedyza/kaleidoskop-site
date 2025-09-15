import time
from celery import shared_task
from api.models import Category
from .serializers import NomenclatureCreateSerializer


@shared_task
def parse_nomenclatures(json: dict):
    nomenclatures = NomenclatureCreateSerializer(data=json)
    if nomenclatures.is_valid():
        nomenclatures.save()
        return True
    print(nomenclatures.errors)
    return False
