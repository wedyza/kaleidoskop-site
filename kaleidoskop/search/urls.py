from django.urls import path

from .views import ItemSearchView

urlpatterns = [
    path("item/<str:query>/", ItemSearchView.as_view()),
]
