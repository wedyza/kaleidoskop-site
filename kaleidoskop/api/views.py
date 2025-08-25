from rest_framework import views, viewsets, permissions, status, mixins, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from django.contrib.auth import get_user_model
from .paginators import CustomPagination
from .serializers import (
    CartSerializer,
    CategorySerializer,
    ItemSerializer,
    LikeSerializer,
    CommentSerializer,
    SwitchSerializer,
    UserSerializer,
)
from .models import Cart, Category, Item, Like, Comment, CartItem
from django_filters.rest_framework import DjangoFilterBackend
from search.views import PaginatedElasticSearchAPIView
from search.documents import ItemDocument
from elasticsearch_dsl import Q
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

User = get_user_model()


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = CustomPagination
    # permissions = (AdminOrReadOnly, )
    filter_backends = [filters.SearchFilter]
    search_fields = ("title",)

    @swagger_auto_schema(manual_parameters=[
        openapi.Parameter('page_size', openapi.IN_QUERY, type=openapi.TYPE_NUMBER),
        openapi.Parameter('page', openapi.IN_QUERY, type=openapi.TYPE_NUMBER)
    ])
    @action(
        methods=["GET"],
        detail=True,
        url_path="items",
        pagination_class=CustomPagination,
    )
    def get_items(self, request, pk):
        category = Category.objects.get(id=pk)
        items = Item.objects.filter(category=category).all()
        page = self.paginate_queryset(items)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)


class WishlistViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
    serializer_class = LikeSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Like.objects.filter(user=self.request.user).all()


class ItemViewSet(viewsets.ModelViewSet, PaginatedElasticSearchAPIView):
    serializer_class = ItemSerializer
    queryset = Item.objects.all()
    pagination_class = CustomPagination
    serializer_class = ItemSerializer
    document_class = ItemDocument

    def generate_q_expression(self, query):
        return Q(
            'multi_match',
            query=query,
            fields = [
                'title',
                'category'
            ],
            fuzziness = 'auto'
        )

    @action(detail=False, methods=["GET"], url_path='search/(?P<queryset>.*)')
    def search(self, request, queryset=None):
        try:
            query = self.generate_q_expression(queryset)
            search = self.document_class.search().query(query)
            total = search.count()
            response = search[0:total].to_queryset()
            results = self.paginate_queryset(response)
            serializer = self.serializer_class(results, many=True)
            return self.get_paginated_response(serializer.data)
        except Exception as e:
            return Response(e, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    @action(
        detail=True,
        methods=["POST"],
        url_path="switch_wishlist",
        permission_classes=(permissions.IsAuthenticated,),
        serializer_class=SwitchSerializer,
    )
    def switch_wishlist(self, request, pk):
        status = self.get_serializer(data=request.data)

        if not status.is_valid():
            return Response(status.errors)
        like = Like.objects.filter(item_id=pk).filter(user=request.user).first()
        if like is not None and not status.data["enable"]:
            like.delete()
        elif like is None and status.data["enable"]:
            like = Like.objects.create(item_id=pk, user=request.user)
            like.save()
        return Response({"enable": status.data["enable"]})

    @action(
        detail=True,
        methods=["POST"],
        url_path="add_to_cart",
        permission_classes=(permissions.IsAuthenticated,),
        serializer_class=SwitchSerializer,
    )
    def add_to_card(self, request, pk):
        data = self.get_serializer(data=request.data)

        if not data.is_valid():
            return Response(data.errors, status=status.HTTP_400_BAD_REQUEST)
        current_cart = (
            Cart.objects.filter(bought=False)
            .filter(current_cart=True)
            .filter(user=self.request.user)
            .first()
        )

        if current_cart is None:
            current_cart = Cart.objects.create(user=self.request.user)
            current_cart.save()

        item = Item.objects.get(pk=pk)
        cart_item = CartItem.objects.filter(item=item).filter(cart=current_cart).first()
        enable = data.data["enable"]
        if enable and cart_item is None:
            cart_item = CartItem.objects.create(cart=current_cart, item=item, amount=1)
            cart_item.save()
        elif not enable and not cart_item is None:
            cart_item.delete()

        return Response({"enabled": enable}, status=status.HTTP_200_OK)


class CommentViewSet(
    viewsets.GenericViewSet,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    mixins.RetrieveModelMixin,
):
    serializer_class = CommentSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    queryset = Comment.objects.all()


class UsersViewSet(
    viewsets.GenericViewSet,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    mixins.RetrieveModelMixin,
):
    serializer_class = UserSerializer
    # permission_classes =
    queryset = User.objects.all()

    @action(
        detail=False,
        methods=["GET", "PATCH"],
        permission_classes=(permissions.IsAuthenticated,),
        url_path="me",
    )
    def active_user(self, request):
        if request.method == "GET":
            serializer = self.serializer_class(request.user)
            return Response(serializer.data)
        serializer = self.serializer_class(
            request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors)

    @action(
        detail=False,
        methods=["GET"],
        permission_classes=(permissions.IsAuthenticated,),
        url_path="me/cart",
        serializer_class=CartSerializer,
    )
    def my_cart(self, request):
        current_cart = (
            Cart.objects.filter(bought=False)
            .filter(current_cart=True)
            .filter(user=self.request.user)
            .first()
        )
        if current_cart is None:
            return []
        serializer = self.serializer_class(instance=current_cart)
        return Response(serializer.data)
