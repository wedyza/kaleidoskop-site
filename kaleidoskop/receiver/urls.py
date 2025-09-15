from django.urls import path
from .views import ReceiveItemsView, ReceiveNomenclaturesView, ReceiveRemainsView


urlpatterns = [
    path("items/", ReceiveItemsView.as_view(), name="receive-items"),
    path("nomenclatures/", ReceiveNomenclaturesView.as_view(), name="receive-items"),
    path("remains/", ReceiveRemainsView.as_view(), name="receive-remains"),
]
