from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .Serializers import (
    UserLoginSerializer,
    UserLoginOTPSerializer,
)
from django.contrib.auth import get_user_model
from exceptions.exceptions import EmailIsNotFree, NotFoundException, OTPTimedOutException, WrongOTPPassedException
from .utils import set_jwt_cookies
from drf_yasg.utils import swagger_auto_schema
from django.middleware.csrf import get_token
from rest_framework import permissions
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from services.auth_service import AuthService

User = get_user_model()

auth_service = AuthService()

class LoginOrRegisterView(APIView):
    permission_classes = (permissions.AllowAny,)

    @swagger_auto_schema(request_body=UserLoginSerializer)
    def post(self, request):
        email = UserLoginSerializer(data=request.data)
        if not email.is_valid():
            return Response(email.errors, status=status.HTTP_400_BAD_REQUEST)

        auth_service.login_or_register(email.data['email'])

        return Response(
            {
                "message": "Письмо с одноразовым кодом отправлено вам на почту. Он действителен в течении 15 минут"
            },
            status=status.HTTP_200_OK,
        )


class ValidateOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    @swagger_auto_schema(request_body=UserLoginOTPSerializer)
    def post(self, request):
        payload = UserLoginOTPSerializer(data=request.data)
        if not payload.is_valid():
            return Response(payload.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            refresh = auth_service.validate_otp(payload.data['email'], payload.data['otp'])
            response = Response(
                {"access": str(refresh.access_token)},
                status=status.HTTP_200_OK,
            )
            response = set_jwt_cookies(response, refresh)
            return response
        except WrongOTPPassedException:
            return Response(
                {"error": "Неправильный код."}, status=status.HTTP_400_BAD_REQUEST
            )
        except OTPTimedOutException:
            return Response( 
                {"error": "Срок действия пароля истек"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except NotFoundException:
            return Response(
                {"error": "Что-то пошло не так"},
                status=status.HTTP_404_NOT_FOUND,
            )
class ChangeEmailOTPView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @swagger_auto_schema(request_body=UserLoginSerializer)
    def post(self, request):
        email = UserLoginSerializer(data=request.data)
        if not email.is_valid():
            return Response(email.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            auth_service.change_email(self.request.user, email.data["email"])
            return Response({"message": "Письмо с подтверждением отправлено на указанную почту. Код действителен в течении 15 минут"})
        except EmailIsNotFree:
            return Response({"detail": "Невозможно поменять почту на данную, она уже занята!"}, status=status.HTTP_400_BAD_REQUEST)

class ValidateChangeEmailOTPView(APIView):
    permission_classes = (permissions.IsAuthenticated, )

    @swagger_auto_schema(request_body=UserLoginOTPSerializer)
    def post(self, request):
        payload = UserLoginOTPSerializer(data=request.data)

        if not payload.is_valid():
            return Response(payload.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            auth_service.validate_change_email_otp(self.request.user, payload.data["otp"])
            return Response({"detail": "Успешно"})
        except OTPTimedOutException:
            return Response({"error": "Срок действия пароля истек"}, status=status.HTTP_400_BAD_REQUEST,)            
        except WrongOTPPassedException:
            return Response({"detail": "Неверный код"}, status=status.HTTP_400_BAD_REQUEST)
    
class CookieTokenRefreshView(JWTAuthentication, TokenRefreshView): # Тут пока не буду менять
    def post(self, request, *args, **kwargs):
        raw_refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['REFRESH_COOKIE']) or None
        raw_acces_token = None
        data = {'access': raw_acces_token, 'refresh': raw_refresh_token}
        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        response = Response(serializer.validated_data, status=status.HTTP_200_OK)
        
        access_token = response.data.get('access')
        refresh_token = response.data.get('refresh')

        if access_token and refresh_token:
            response = set_jwt_cookies(response, refresh_token)

        response.data = {'access': access_token}
        return response
    

class LogoutView(APIView):
    def post(self, request):
        response = Response({"detail": "success"})
        response.delete_cookie('refresh_token', path='/')
        return response


def get_csrf(request) -> Response:
    response = JsonResponse({'detail': 'CSRF cookie set!!!'})
    response['X-CSRFToken'] = get_token(request)
    return response