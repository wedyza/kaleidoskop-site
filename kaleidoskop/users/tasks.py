from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from celery import shared_task
from django.template.loader import render_to_string
from .models import CustomAbstractUser
from api.serializers import CartTo1CSerializer
from typing import Dict
import httpx

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


def create_order_1c(cart_serializer: CartTo1CSerializer, user: CustomAbstractUser):
    response = client.post(
            settings.SERVER_1C + '/orders/',
            json= cart_serializer.data | {
                "user_code": user.code,
                "warehouse": "1",
                "delivery_type": "Самовывоз"
            },
            timeout=15
        )
    print(cart_serializer.data | {
                "user_code": user.code,
                "warehouse": "1",
                "delivery_type": "Самовывоз"})
    return response


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
def link_with_1c(user: CustomAbstractUser):
    """
    При регистрации связывает пользователя с контрагентов в 1С
    """
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
def update_user_1c(user: CustomAbstractUser):
    """
    Обновляет пользователя в 1С системе по его текущим, вызывать при UPDATE users/me/
    """
    client.put(
        LINK_1C + '/users',
        params={"API_KEY": settings.API_KEY_1C}, 
        json={
            "code": user.code,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "middle_name": user.middle_name,
            "phone_number": user.phone_number
        },
        timeout=15
    )
    