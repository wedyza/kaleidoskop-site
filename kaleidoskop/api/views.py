from rest_framework import views, viewsets, permissions, status, mixins, filters
from django_filters import rest_framework as rf_filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .paginators import CustomPagination
from admin_panel.models import Compilation
from typing import Any
from django.core.exceptions import ValidationError
from exceptions.exceptions import NotFoundException
from .serializers import (
    BrandSerializer,
    CartItemSerializer,
    CartSerializer,
    CategorySerializer,
    ItemCartAmountSerialzier,
    ItemDetailSerializer,
    LikeSerializer,
    CommentSerializer,
    ListCartItemSerializer,
    OrderSerializer,
    PublicBannerSerializer,
    PublicCompilationSerializer,
    ShopSerializer,
    SwitchSerializer,
    UserSerializer,
    CartTo1CSerializer,
    ItemListSerializer
)
from .models import Banner, Brand, Cart, Category, Item, Like, Comment, CartItem, Order, Shop
from search.views import PaginatedElasticSearchAPIView
from search.documents import ItemDocument
from elasticsearch_dsl import Q
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
# from .functions import get_daughter_nomenclatures, get_items_queryset_of_category
from django.db.models import F, Sum
from users.tasks import delete_order_1c, update_user_1c, create_order_1c, produce_tg_notification
from services.category_service import CategoryService
from services.item_service import ItemService
from services.like_service import LikeService
import httpx
from .filters import ItemFilter
from django.utils import timezone
from django.conf import settings

User = get_user_model()
# Может быть потом выделить сервисный слой и работать в нём?
class CategoryViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin):
    queryset = Category.objects.filter(active=True).all()
    serializer_class = CategorySerializer
    service = CategoryService()
    pagination_class = CustomPagination
    permissions = (permissions.AllowAny, )
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    ordering_fields = ['price']
    search_fields = ("title",)

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter("page_size", openapi.IN_QUERY, type=openapi.TYPE_NUMBER),
            openapi.Parameter("page", openapi.IN_QUERY, type=openapi.TYPE_NUMBER),
            openapi.Parameter("min_price", openapi.IN_QUERY, type=openapi.TYPE_NUMBER, required=False, description='Минимальная цена'),
            openapi.Parameter("max_price", openapi.IN_QUERY, type=openapi.TYPE_NUMBER, required=False, description='Максимальная цена'),
            openapi.Parameter("brands", openapi.IN_QUERY, type=openapi.TYPE_STRING, required=False, description='Название бренда', style={'type': 'array', 'items': {'type': 'string'}}, explode=False, example='UUID1,UUID2,UUID3..'),
            openapi.Parameter("ordering", openapi.IN_QUERY, description='Поля для сортировки: price', type=openapi.TYPE_STRING, enum=['price', '-price'])
        ]
    )
    @action(
        methods=["GET"],
        detail=True,
        url_path="items",
        pagination_class=CustomPagination,
        serializer_class=ItemListSerializer,
    )
    def get_items(self, request, pk):
        items = self.service.get_items_of_category(pk)
        filter = ItemFilter(request.GET, queryset=items)
        if not filter.is_valid():
            return Response(filter.errors, status=400)
        items = self.filter_queryset(filter.qs)
        page = self.paginate_queryset(items)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)


class WishlistViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
    serializer_class = LikeSerializer
    permission_classes = (permissions.IsAuthenticated,)
    service = LikeService()
    
    def get_queryset(self):
        return self.service.get_likes_of_user(self.request.user.id)

class ItemViewSet(viewsets.ModelViewSet, PaginatedElasticSearchAPIView):
    queryset = Item.objects.all()
    pagination_class = CustomPagination
    filter_backends = [rf_filters.DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['price']
    filterset_class = ItemFilter
    service = ItemService()
    document_class = ItemDocument
    
    def get_serializer_class(self) -> ItemDetailSerializer | ItemListSerializer:
        if self.action == 'retrieve':
            return ItemDetailSerializer
        return ItemListSerializer
    
    def serializer_class(self, *args, **kwargs) -> ItemDetailSerializer | ItemListSerializer:
        if self.action == 'retrieve':
            return ItemDetailSerializer(*args, **kwargs)
        return ItemListSerializer(*args, **kwargs)

    def generate_q_expression(self, query) -> Q:
        return Q(
            "multi_match", query=query, fields=["title", "category"], fuzziness="auto"
        )

    def get_serializer_context(self) -> dict[str, Any]:
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter("page_size", openapi.IN_QUERY, type=openapi.TYPE_NUMBER),
            openapi.Parameter("page", openapi.IN_QUERY, type=openapi.TYPE_NUMBER),
            openapi.Parameter("min_price", openapi.IN_QUERY, type=openapi.TYPE_NUMBER, required=False, description='Минимальная цена'),
            openapi.Parameter("max_price", openapi.IN_QUERY, type=openapi.TYPE_NUMBER, required=False, description='Максимальная цена'),
            openapi.Parameter("brands", openapi.IN_QUERY, type=openapi.TYPE_STRING, required=False, description='Название бренда', style={'type': 'array', 'items': {'type': 'string'}}, explode=False, example='UUID1,UUID2,UUID3..'),
            openapi.Parameter("ordering", openapi.IN_QUERY, description='Поля для сортировки: price', type=openapi.TYPE_STRING, enum=['price', '-price'])
        ]
    )
    @action(detail=False, methods=["GET"], url_path="search/(?P<queryset>.*)") # Тут взаимодействие с другим сервисом, хз, надо ли выделять или я потом вообще на индексы в Postgresql перейду
    def search(self, request, queryset=None):
        try:
            query = self.generate_q_expression(queryset)
            search = self.document_class.search().query(query)
            total = search.count()
            response = search[0:total].to_queryset()
            filter = ItemFilter(request.GET, queryset=response)
            if not filter.is_valid():
                return Response(filter.errors, status=400)
            response = self.filter_queryset(filter.queryset)
            results = self.paginate_queryset(response)
            serializer = self.serializer_class(results, context={"request": request}, many=True)
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
        
        result = self.service.switch_wishlist_to_item(item_pk=pk, user_pk=self.request.user.id, status=status.data["enable"])
        return Response({"enable": result})

    @action(
        detail=True,
        methods=["POST"],
        url_path="add_to_cart",
        permission_classes=(permissions.IsAuthenticated,),
        serializer_class=SwitchSerializer,
    )
    def add_to_cart(self, request, pk):
        data = self.get_serializer(data=request.data)
        if not data.is_valid():
            return Response(data.errors, status=status.HTTP_400_BAD_REQUEST)
        enable = data.data["enable"]
        result = self.service.add_item_to_cart(pk, self.request.user.id, enable)
        return Response({"enabled": result}, status=status.HTTP_200_OK)
    

    @swagger_auto_schema(request_body=ItemCartAmountSerialzier(), responses={201: CartItemSerializer()})
    @action(
        detail=True,
        permission_classes=(permissions.IsAuthenticated,),
        methods=["PATCH"],
        url_path="cart/update_amount",
        serializer_class=ItemCartAmountSerialzier
    )
    def change_cart_count(self, request, pk):
        amount = self.get_serializer(data=request.data)
        if not amount.is_valid():
            return Response(amount.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            updated_cart_item = self.service.update_cart_item_amount(pk, self.request.user.id, amount.validated_data['amount'])
            return Response(CartItemSerializer(instance=updated_cart_item, context={"request": request}).data)
        except NotFoundException:
            return Response({"detail": "This item is not currently in cart!"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return Response(e, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class CommentViewSet(
    viewsets.GenericViewSet,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    mixins.RetrieveModelMixin,
):
    serializer_class = CommentSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_queryset(self):
        return Comment.objects.filter(user=self.request.user).all()
    
    def create(self):
        comment = self.get_serializer(data=self.request.data)

        if not comment.is_valid():
            return Response(comment.errors, status=status.HTTP_400_BAD_REQUEST)
        
        bought  = CartItem.objects.filter(cart__in=(Cart.objects.filter(user=self.request.user).exclude(order=None).all())).values_list("item_id", flat=True).distinct() # Щас поменяю

        if comment.initial_data["item"] not in bought:
            return Response(
                {"detail": "You cant comment this item yet"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        comment.save(user=self.request.user)
        return Response(comment.data, status=status.HTTP_201_CREATED)


class UsersViewSet(
    viewsets.GenericViewSet,
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
            update_user_1c(request.user.id)
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
            Cart.objects.filter(order=None)
            .filter(current_cart=True)
            .filter(user=self.request.user)
            .first()
        )
        if current_cart is None:
            return Response([])
        serializer = self.serializer_class(instance=current_cart, context={"request": request})
        return Response(serializer.data)


class CartItemViewSet(viewsets.GenericViewSet,
                      mixins.UpdateModelMixin,
                      mixins.DestroyModelMixin):
    model = CartItem
    serializer_class = CartItemSerializer
    permission_classes = (permissions.IsAuthenticated,) # Добавить потом Owner, чтобы ограничить вмешательство в чужие корзины

    def get_queryset(self):
        return CartItem.objects.filter(cart__in=(Cart.objects.filter(user=self.request.user).filter(current_cart=True))).all()


class CartItemView(views.APIView):
    def validate(self, data):
        if 'ids' not in data.keys() or 'enable' not in data.keys():
            raise ValidationError("Missing ids or enable statement")
        if len(data['ids']) != len(set(data['ids'])):
            raise ValidationError("Multiple updates to a single element found")
        return data['ids'], data['enable']
    
    @swagger_auto_schema(request_body=ListCartItemSerializer, operation_summary="Сюда просто [uuid1, uuid2, uuid3...]")
    def post(self, request):
        """
        То есть в целом формат будет такой:
        {
            \t"ids": [uuid1, uuid2, uuid3...],
            \t"enable": True/False
        }
        """
        ids, enable = self.validate(request.data)
        queryset = CartItem.objects.filter(id__in=ids).update(marked_for_order=enable)
        return Response({"detail": f"Successfully marked {len(ids)} items as {enable==1}"}, status=status.HTTP_200_OK)
        

class OrderViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.CreateModelMixin):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated, )
    pagination_class = CustomPagination

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).all()
    
    @swagger_auto_schema(manual_parameters=[
            openapi.Parameter("page_size", openapi.IN_QUERY, type=openapi.TYPE_NUMBER),
            openapi.Parameter("page", openapi.IN_QUERY, type=openapi.TYPE_NUMBER),
        ])
    def list(self, request, *args, **kwargs):
        orders = self.get_queryset()
        page = self.paginate_queryset(orders)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)


    def create(self, request, *args, **kwargs):
        order = self.get_serializer(data=request.data)
        if not order.is_valid():
            return Response(order.errors, status=status.HTTP_400_BAD_REQUEST)

        if request.user.code == None or request.user.first_name == None or request.user.phone_number == None:
            return Response({'detail': 'Невозможно создать заказ, если мы не знаем вашего номера или даже имени!'}, status=status.HTTP_400_BAD_REQUEST)

        cart = Cart.objects.filter(order=None).filter(current_cart=True).filter(user=self.request.user).first()
        if cart is None:
            return Response({"detail": "Невозможно создать заказ с пустой корзиной!"}, status=status.HTTP_400_BAD_REQUEST)
        
        items_for_order = cart.items.filter(marked_for_order=True)
        
        total_sum = items_for_order.aggregate(total=Sum(F("item__price") * F("amount")))["total"]
        if total_sum == 0 or total_sum == None:
            return Response({"detail": "Невозможно создать заказ с пустой корзиной!"}, status=status.HTTP_400_BAD_REQUEST)

        aviable_to_create = items_for_order.filter(amount__lte=Sum("item__remains__count")).count() == items_for_order.count()
        if not aviable_to_create:
            excluded = items_for_order.annotate(remains_sum=Sum("item__remains__count")).filter(amount__gt=F("remains_sum")).all()
            return Response({"detail": "Невозможно создать заказ. Для данных товаров не хватает запасов на складе!", "items": [item.item.title for item in excluded]}, status=status.HTTP_400_BAD_REQUEST)

        order_cart = Cart.objects.create(user=request.user, current_cart=False)
        order_cart.items.add(*items_for_order.all())
        
        if order.validated_data['delivery_method'] == 'Доставка':
            address_data = order.validated_data['address']
        else:
            shop = order.validated_data['shop']
            address_data = {
                'city': shop.city,
                'street': shop.street,
                'house': shop.house
            }

        cart_serializer = CartTo1CSerializer(instance=order_cart)        
        order_data = cart_serializer.data | {'address': address_data, 'payment_method': order.validated_data['payment_method'], 'delivery_type': order.validated_data['delivery_method'], 'user_code': request.user.code}

        try: 
            response = create_order_1c(order_data)
        except httpx.TimeoutException:
            return Response({"detail": "Запущено в режиме отладки"})
        except Exception as e:
            cart.items.add(*order_cart.items.all())
            order_cart.delete()
            return Response(e, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        instance = order.save(user=self.request.user, code=response["code"], total_price=total_sum)
        order_cart.order = instance
        order_cart.save()
        produce_tg_notification(order_data={
                'code': instance.code,
                'created_at': timezone.now().astimezone(settings.LOCAL_TZ).strftime("%d/%m/%Y, %H:%M:%S"),
                'user': {
                    'first_name': instance.user.first_name,
                    'last_name': instance.user.last_name,
                    'middle_name': instance.user.middle_name,
                    'phone_number': instance.user.phone_number
                },
                'delivery_type': instance.delivery_method
            })            
        return Response(self.get_serializer(instance=instance).data)
    
    @action(methods=['DELETE'], detail=True, permission_classes=(permissions.IsAuthenticated,), url_path='cancel')
    def cancel_order(self, request, pk):
        order = Order.objects.get(id=pk)
        if request.user != order.user:
            return Response({"detail": "You can't cancel this order!"}, status=status.HTTP_401_UNAUTHORIZED)
        
        if order.status == Order.OrderStatus.SENDED:
            delete_order_1c(order.code) 
            order.delete()
        else:
            return Response({'detail': 'Невозможно отменить заказ, который был согласован. Чтобы отменить его, позвоните менеджеру'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "success"})

class BrandViewSet(viewsets.GenericViewSet):
    serializer_class = BrandSerializer
    permission_classes = (permissions.AllowAny,)

    @action(methods=["GET"], detail=False, url_path="(?P<pk>[^/.]+)") # для получения брендов по категории
    def get_brands_of_category(self, request, pk):
        try:
            category = Category.objects.get(id=pk)
        except:
            return Response({"detail": "Not found category with that id"}, status=status.HTTP_404_NOT_FOUND)
        items = get_items_queryset_of_category(category)
        queryset = Brand.objects.filter(id__in=items.values_list("brand_id", flat=True).distinct()).all()
        return Response(self.get_serializer(instance=queryset, many=True).data)


class ShopViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer
    permission_classes = (permissions.AllowAny,)


class PublicBannerViewSet(viewsets.GenericViewSet):
    serializer_class = PublicBannerSerializer
    permission_classes = (permissions.AllowAny, )

    def get_queryset(self):
        if self.action == 'first_group':
            return Banner.objects.filter(group_type=Banner.BannerGroupType.FIRST).filter(active=True).order_by('queue').all()
        return Banner.objects.filter(group_type=Banner.BannerGroupType.SECOND).filter(active=True).order_by('queue').all()

    @action(detail=False, methods=['GET'], url_path='first_group')
    def first_group(self, request):
        return Response(self.get_serializer(instance=self.get_queryset(), many=True).data)
    
    @action(detail=False, methods=['GET'], url_path='second_group')
    def second_group(self, request):
        return Response(self.get_serializer(instance=self.get_queryset(), many=True).data)
    

class PublicCompilationViewSet(viewsets.GenericViewSet):
    serializer_class = PublicCompilationSerializer
    permission_classes = permissions.AllowAny

    def get_queryset(self):
        today = timezone.now()
        queryset = Compilation.objects.filter(active=True).filter(Q(end_time=None) | Q(end_time__lte=today)).order_by('-queue')
        return queryset

    @action(methods=['GET'], url_path='first', detail=False)
    def get_first(self, request):
        qs = self.get_queryset()
        if qs.count() > 0:
            return qs[0]
    
    @action(methods=['GET'], url_path='second', detail=False)
    def get_second(self, request):
        qs = self.get_queryset()
        if qs.count() > 1:
            return qs[1]
    
    @action(methods=['GET'], url_path='third', detail=False)
    def get_third(self, request):
        qs = self.get_queryset()
        if qs.count > 2:
            return qs[2]
    
    @action(methods=['GET'], url_path='fourth', detail=False)
    def get_fourth(self, request):
        qs = self.get_queryset()
        if qs.count > 3:
            return qs[3]
    