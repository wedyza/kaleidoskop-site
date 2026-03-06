from django.conf import settings
from celery import shared_task
import httpx

LINK_1C = settings.SERVER_1C    

client = httpx.Client(auth=httpx.BasicAuth(username=settings.USER_1C, password=settings.PASSWORD_1C))


# @multitasker
# @shared_task
def create_order_1c(order_serializer):
    print(order_serializer)
    response = client.post(
            settings.SERVER_1C + '/orders/',
            json= order_serializer,
            timeout=15
        )
    return response.json()



# r = redis.StrictRedis(
#         host=settings.REDIS_HOST,  # из Endpoint
#         port=6379,  # из Endpoint
#         decode_responses=True
#     )
