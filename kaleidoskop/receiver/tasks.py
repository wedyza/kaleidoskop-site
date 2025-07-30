import time
from celery import shared_task
from api.models import Category
from .serializers import CategoryCreateSerializer


@shared_task
def parse_categories(json:dict):
    categories = CategoryCreateSerializer(data=json)
    if categories.is_valid():
        categories.save()
        return True
    print(categories.errors)
    return False