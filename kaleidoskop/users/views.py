from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .Serializers import (
    UserCreateSerializer,
    UserLoginSerializer,
    UserLoginOTPSerializer,
)
from django.contrib.auth import get_user_model
from .utils import enforce_csrf, generate_otp, set_jwt_cookies
from .tasks import send_otp_email
from drf_yasg.utils import swagger_auto_schema
from django.middleware.csrf import get_token
from rest_framework import permissions
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from rest_framework import permissions
from django.utils.decorators import method_decorator
from rest_framework_simplejwt.authentication import JWTAuthentication

User = get_user_model()

class LoginOrRegisterView(APIView):
    permission_classes = (permissions.AllowAny,)

    @swagger_auto_schema(request_body=UserLoginSerializer)
    def post(self, request):
        email = UserLoginSerializer(data=request.data)
        if not email.is_valid():
            return Response(email.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email.data["email"])
        except User.DoesNotExist as e:
            user = User.objects.create(email=email.data["email"])

        otp = generate_otp()
        user.otp = otp
        user.otp_expires = timezone.now() + timezone.timedelta(minutes=15)
        user.save()

        send_otp_email(email.data["email"], otp)

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
            user = User.objects.get(email=payload.data["email"])
        except User.DoesNotExist:
            return Response(
                {"error": "Пользователя с такой почтой не существует."},
                status=status.HTTP_404_NOT_FOUND,
            )

        otp = payload.data["otp"]
        if user.otp == otp:
            if timezone.now() > user.otp_expires:
                return Response(  # pragma: no cover
                    {"error": "Срок действия пароля истек"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.otp = None
            user.otp_expires = None
            user.save()

            refresh = RefreshToken.for_user(user)
            refresh.payload.update({"user_id": user.pk, "email": user.email})

            response = Response(
                {"access": str(refresh.access_token)},
                status=status.HTTP_200_OK,
            )
            response = set_jwt_cookies(response, refresh)

            return response
        else:
            return Response(
                {"error": "Неправильный код."}, status=status.HTTP_400_BAD_REQUEST
            )
        

class ChangeEmailOTPView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    @swagger_auto_schema(request_body=UserLoginSerializer)
    def post(self, request):
        email = UserLoginSerializer(data=request.data)
        if not email.is_valid():
            return Response(email.errors, status=status.HTTP_400_BAD_REQUEST)
        
        
        user_exists = User.objects.filter(email=email.data["email"]).exists()
        if user_exists:
            return Response({"detail": "Невозможно поменять почту на данную!"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user

        otp = generate_otp()
        user.email_to_change = email.data["email"]
        user.otp_change_email = otp
        user.otp_expires_change_email = timezone.now() + timezone.timedelta(minutes=15)
        user.save()

        send_otp_email(email.data["email"], otp)

        return Response({"message": "Письмо с подтверждением отправлено на указанную почту. Код действителен в течении 15 минут"})


class ValidateChangeEmailOTPView(APIView):
    permission_classes = (permissions.IsAuthenticated, )

    @swagger_auto_schema(request_body=UserLoginOTPSerializer)
    def post(self, request):
        payload = UserLoginOTPSerializer(data=request.data)

        if not payload.is_valid():
            return Response(payload.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user

        otp = payload.data["otp"]
        if user.otp_change_email == otp:
            if timezone.now() > user.otp_expires_change_email:
                return Response(  # pragma: no cover
                    {"error": "Срок действия пароля истек"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            user.otp_change_email = None
            user.otp_expires_change_email = None
            user.email = user.email_to_change
            user.email_to_change = None
            user.save()

            return Response({"detail": "Успешно"})
        else:
            return Response({"detail": "Неверный код"}, status=status.HTTP_400_BAD_REQUEST)
    
class CookieTokenRefreshView(JWTAuthentication, TokenRefreshView):
    def post(self, request, *args, **kwargs):
        raw_refresh_token = request.COOKIES.get(settings.SIMPLE_JWT['REFRESH_COOKIE']) or None
        # raw_acces_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE']) or None
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