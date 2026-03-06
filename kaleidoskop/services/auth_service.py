from services.user_service import UserService
from users.models import CustomAbstractUser
from services.async_service import multitasker
from celery import shared_task
from services.user_service import UserService
import string
from django.core.mail import EmailMultiAlternatives
from rest_framework_simplejwt.tokens import RefreshToken
from django.template.loader import render_to_string
from django.conf import settings
from exceptions.exceptions import EmailIsNotFree
from random import random

class AuthService:
    __user_service = UserService()
    
    def __generate_otp(self, length=6):
        characters = string.digits
        otp = "".join(random.choice(characters) for _ in range(length))
        return otp
    
    
    @multitasker
    @shared_task
    def __send_otp_email(self, email, otp):
        """
        Отправляет письмо на почту соответственно
        """
        subject = "Ваш одноразовый пароль для авторизации"
        message = f"Ваш одноразовый пароль: {otp}"
        from_email = settings.EMAIL_HOST_USER
        recipient_list = [email]
        msg = EmailMultiAlternatives(subject, message, from_email, recipient_list)

        html_content = render_to_string(
            "email_otp.html", {"site_name": "Калейдоскоп", "OTP": otp}
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()
    
    
    def login_or_register(self, email: str):
        user = self.__user_service.get_or_create_user_by_email(email)
        otp = self.__generate_otp()
        self.__user_service.fill_user_otp(user, otp)
        self.__send_otp_email(user.email, otp)
    
    
    def validate_otp(self, email: str, otp: str) -> RefreshToken:
        validated_user = self.__user_service.check_user_otp(email, otp)
        refresh = RefreshToken.for_user(validated_user)
        refresh.payload.update({"user_id": validated_user.pk, "email": validated_user.email})
        return refresh
        
        
    def change_email(self, user: CustomAbstractUser, email: str):
        if self.__user_service.check_email_is_free(email):
            otp = self.__generate_otp()
            self.__user_service.start_email_change(user, email, otp)
            self.__send_otp_email(email, otp)
        raise EmailIsNotFree
    
    
    def validate_change_email_otp(self, user: CustomAbstractUser, otp: str) -> bool:
        return self.__user_service.validate_user_email_change_otp(user, otp)