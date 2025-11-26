from django.urls import path
from .views import ChangeEmailOTPView, LoginView, ValidateChangeEmailOTPView, ValidateOTPView, RegisterView
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path("register/", RegisterView.as_view(), name="registration"),
    path("create-otp/", LoginView.as_view(), name="email-otp-login"),
    path(
        "validate-otp/",
        ValidateOTPView.as_view(),
        name="email-otp-validate",
    ),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("change-email/", ChangeEmailOTPView.as_view(), name='change-email'),
    path('change-email/validate', ValidateChangeEmailOTPView.as_view(), name='otp-change-email')
]
