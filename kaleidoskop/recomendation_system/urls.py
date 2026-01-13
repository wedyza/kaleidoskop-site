from django.urls import path
from .views import ContentRecommendationView, CollaborativeRecomendationView

urlpatterns = [
    path('content_based/', ContentRecommendationView.as_view(), name='content-based'),
    path('collaborative/', CollaborativeRecomendationView.as_view(), name='collaborative')
]
