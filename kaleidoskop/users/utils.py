import random
import string
from functools import wraps
from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions, request, response

def generate_otp(length=6):
    characters = string.digits
    otp = "".join(random.choice(characters) for _ in range(length))
    return otp

def enforce_csrf(func):
    """
    Декоратор для принудительной проверки CSRF.
    """
    @wraps(func)
    def wrapped_view(request, *args, **kwargs):
        check = CSRFCheck(lambda r: None)
        check.process_request(request)
        reason = check.process_view(request, None, (), {})
        if reason:
            raise exceptions.PermissionDenied('CSRF Failed: %s' % reason) 
        return func(request, *args, **kwargs)
    return wrapped_view

def set_jwt_cookies(response: response.Response, refresh_token: str) -> response.Response:
    # response.set_cookie(
    #     'access_token',
    #     access_token,
    #     max_age=4 * 60,  # 4 минуты
    #     # max_age=10,  # 4 минуты
    #     httponly=True,    # Защита от XSS
    #     secure=True,      # Включить для продакшн режима
    #     samesite='None', # Защита от CSRFб
        
    # )
    response.set_cookie(
        'refresh_token',
        refresh_token,
        # max_age=24 * 60 * 60,  # 1 день
        max_age=100 * 60,  # 1 день
        httponly=True,
        secure=True,
        samesite='None'
    )
    return response