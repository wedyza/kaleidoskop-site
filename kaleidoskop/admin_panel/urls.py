from django.urls import path, include
from .views import LinkTelegrammView, BannerViewSet, AdminCategoryViewSet, AdminNomenclaturesViewSet, CompilationViewSet
from rest_framework.routers import DefaultRouter


router = DefaultRouter()

router.register('banner', BannerViewSet, basename='banners')
router.register('categories', AdminCategoryViewSet, basename='admin-categories')
router.register("nomenclatures", AdminNomenclaturesViewSet, basename='nomenclantures')
router.register('compilations', CompilationViewSet, basename='admin-compilations')


urlpatterns = [
    path("telegram_session/", LinkTelegrammView.as_view(), name="link-session"),
    path("", include(router.urls))
]
