from django.urls import path
from .views import ReceiveItemsView, ReceiveCategoriesView, ReceiveRemainsView


urlpatterns = [
    path('items/', ReceiveItemsView.as_view(), name='receive-items'),
    path('categories/', ReceiveCategoriesView.as_view(), name='receive-items'),
    path('remains/', ReceiveRemainsView.as_view(), name='receive-remains')
]
