from celery import shared_task
import httpx

MODEL_URL = "http://localhost:8081/"

@shared_task
def train_model():
    from .serializers import ItemToAIModel
    from api.models import Item
    all_items = Item.objects.all()
    serializer = ItemToAIModel(all_items, many=True)

    response = httpx.post(
        url=MODEL_URL+'train', json=serializer.data, timeout=0.001
    )
    print(response)