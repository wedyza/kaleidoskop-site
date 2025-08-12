from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions, routers
from .views import ItemViewSet, CommentViewSet, WishlistViewSet, CategoryViewSet, UsersViewSet


router = routers.DefaultRouter()

router.register("items", ItemViewSet)
router.register("comments", CommentViewSet, basename='comments')
router.register("users/me/wishlist", WishlistViewSet, basename='wishlist')
router.register("categories", CategoryViewSet)
router.register("users", UsersViewSet, basename='users')
# router.register("users/me/cart", CartViewSet, basename='cart')

urlpatterns = [
    path('', include(router.urls)),
    path('receive/', include('receiver.urls')),
    path('auth/', include('users.urls'))
]

schema_view = get_schema_view(
    openapi.Info(
        title="site construct API",
        default_version="v1",
        description="Документация для приложения site construct",
        # terms_of_service="URL страницы с пользовательским соглашением",
        contact=openapi.Contact(email="wedyza@mail.ru"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

if settings.DEBUG:
    urlpatterns += [
        re_path(
            r"^swagger(?P<format>\.json|\.yaml)$",
            schema_view.without_ui(cache_timeout=0),
            name="schema-json",
        ),
        re_path(
            r"^swagger/$",
            schema_view.with_ui("swagger", cache_timeout=0),
            name="schema-swagger-ui",
        ),
        re_path(
            r"^redoc/$", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"
        ),
    ]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) #pragma: no cover
