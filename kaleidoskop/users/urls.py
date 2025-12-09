from django.urls import path
from .views import ChangeEmailOTPView, LoginOrRegisterView, ValidateChangeEmailOTPView, ValidateOTPView, CookieTokenRefreshView, get_csrf
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('csrf/', get_csrf, name='get_csrf'),
    path("create-otp/", LoginOrRegisterView.as_view(), name="email-otp-login"),
    path(
        "validate-otp/",
        ValidateOTPView.as_view(),
        name="email-otp-validate",
    ),
    path("change-email/", ChangeEmailOTPView.as_view(), name='change-email'),
    path('change-email/validate', ValidateChangeEmailOTPView.as_view(), name='otp-change-email'),
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token-refresh'),
]
