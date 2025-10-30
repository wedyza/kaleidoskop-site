from django.urls import path
from .views import LinkTelegrammView


urlpatterns = [
    path("telegram_session/", LinkTelegrammView.as_view(), name="link-session"),
]
