from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from celery import shared_task
from django.template.loader import render_to_string
from .models import CustomAbstractUser
from api.serializers import CartTo1CSerializer
from typing import Dict
import httpx
import json
import redis
from admin_panel.rabbitmq import RabbitMQ

LINK_1C = settings.SERVER_1C    

client = httpx.Client(auth=httpx.BasicAuth(username=settings.USER_1C, password=settings.PASSWORD_1C))

def multitasker(f): #Позволяет не бегать туда сюда и менять лишь 1 значение
    """
    Декоратор, который управляет запуском тасков
    Если settings.CONTAINER_LAUNCHER = True, то запускает их в Celery Worker,
    Иначе как обычную функцию
    """
    def wrapper(*args, **kwargs):
        if settings.CONTAINER_LAUNCHER:
            return f.delay(*args, **kwargs)
        return f(*args, **kwargs)
    return wrapper


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


@multitasker
@shared_task
def delete_order_1c(order_code): # Тут надо будет скорее всего изменить, чтобы в созданном заказе все товары были отменены или что-то типа того.. Надо будет, опять же, выяснить детали у Дяди Толи
    response = client.request(
        method="DELETE",
        url=settings.SERVER_1C + '/orders/',
        json={
            'code': order_code
        },
        timeout=15
    )

@multitasker
@shared_task
def send_otp_email(email, otp):
    """
    Отправляет письмо на почту соответственно
    """
    subject = "Your OTP for Login"
    message = f"Your OTP is: {otp}"
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [email]
    msg = EmailMultiAlternatives(subject, message, from_email, recipient_list)

    html_content = render_to_string(
        "email_otp.html", {"site_name": "Калейдоскоп", "OTP": otp}
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send()

@multitasker
@shared_task
def link_with_1c(user_id):
    """
    При регистрации связывает пользователя с контрагентов в 1С
    """
    user = CustomAbstractUser.objects.get(user_id)
    response = client.post(LINK_1C + '/users', 
                        params={"API_KEY": settings.API_KEY_1C}, 
                        json={"email": user.email},
                        timeout=15)
    if response.status_code == 201:
        code = response.json()['partner_code']
        user.code = code
        user.save()
    else:
        print("something went wrong")

@multitasker
@shared_task
def update_user_1c(user_id):
    """
    Обновляет пользователя в 1С системе по его текущим, вызывать при UPDATE users/me/
    """
    user = CustomAbstractUser.objects.get(id=user_id)
    # print("START")
    response = client.put(
        LINK_1C + '/users',
        params={"API_KEY": settings.API_KEY_1C}, 
        json={
            "existed": user.previously_existed,
            "code": user.code,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "middle_name": user.middle_name,
            "phone_number": user.phone_number,
            "email": user.email
        },
        timeout=60
    )
    # print("END")
    # print(response)
    if response.status_code == 200:
        response = response.json()
        if user.code is None:
            user.code = response['code'].strip()
            user.previously_existed = response['existed']
            user.save()
    


@multitasker
@shared_task
def sync_items():
    response = client.get(
        LINK_1C + '/items/',
        params={"API_KEY": settings.API_KEY_1C},
        timeout=60
    )
    if response.status_code != 200:
        raise BaseException("something went wrong")
    items = response.json()
    return items

@multitasker
@shared_task
def sync_nomenclatures():
    response = client.get(
        LINK_1C + '/nomenclatures/',
        params={"API_KEY": settings.API_KEY_1C},
        timeout=60
    )
    if response.status_code != 200:
        raise BaseException("somethign went wrong")
    return response.json()

@multitasker
@shared_task
def sync_remains():
    response = client.get(
        LINK_1C + '/remains/',
        params={"API_KEY": settings.API_KEY_1C},
        timeout=15
    )
    if response.status_code != 200:
        raise BaseException("somethign went wrong")
    return response.json()


r = redis.StrictRedis(
        host=settings.REDIS_HOST,  # из Endpoint
        port=6379,  # из Endpoint
        decode_responses=True
    )

rq = RabbitMQ()


@multitasker    
@shared_task
def produce_tg_notification(order_data):
    rq.publish(action="new_order", message=json.dumps(order_data, ensure_ascii=False))
    print("Published new order message")

@multitasker
@shared_task
def train_content_based_model():
    from recomendation_system.serializers import ItemToAIModel
    from api.models import Item
    all_items = Item.objects.all()
    serializer = ItemToAIModel(all_items, many=True)
    try:
        response = httpx.post(
            url=f"http://{settings.RECOMENDATIONS_URL}/train/content", json=serializer.data, timeout=0.5
        )
    except httpx.TimeoutException as e:
        print("Началось обучение")

@multitasker
@shared_task
def train_collaborative_model():
    ...