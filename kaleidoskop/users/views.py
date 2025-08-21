from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .Serializers import (
    UserCreateSerializer,
    UserLoginSerializer,
    UserLoginOTPSerializer,
)
from django.contrib.auth import get_user_model
from .utils import generate_otp
from .tasks import send_otp_email
from rest_framework.authtoken.models import Token
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

# Create your views here.

User = get_user_model()


class RegisterView(APIView):
    permission_classes = (permissions.AllowAny,)

    @swagger_auto_schema(request_body=UserCreateSerializer)
    def post(self, request):
        new_user = UserCreateSerializer(data=request.data)
        if not new_user.is_valid():
            return Response(new_user.errors, status=status.HTTP_400_BAD_REQUEST)
        user = new_user.save()

        otp = generate_otp()
        user.otp = otp
        user.otp_expires = timezone.now() + timezone.timedelta(minutes=15)
        user.save()
        # send_otp_email.delay(new_user.data["email"], otp)

        return Response(  # pragma: no cover
            {
                "message": "Письмо с одноразовым кодом отправлено вам на почту. Он действителен в течении 15 минут"
            },
            status=status.HTTP_200_OK,
        )


class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    @swagger_auto_schema(request_body=UserLoginSerializer)
    def post(self, request):
        email = UserLoginSerializer(data=request.data)
        if not email.is_valid():
            return Response(email.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email.data["email"])
        except User.DoesNotExist as e:
            return Response(
                {"error": "User is not found"}, status=status.HTTP_404_NOT_FOUND
            )

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

            return Response(
                {"refresh": str(refresh), "access": str(refresh.access_token)},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"error": "Неправильный код."}, status=status.HTTP_400_BAD_REQUEST
            )
