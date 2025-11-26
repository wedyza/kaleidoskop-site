from rest_framework import views, viewsets, permissions, status, mixins, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .paginators import CustomPagination
from django.core.exceptions import ValidationError
from .serializers import (
    CartItemSerializer,
    CartSerializer,
    CategorySerializer,
    ItemCartAmountSerialzier,
    ItemSerializer,
    LikeSerializer,
    CommentSerializer,
    ListCartItemSerializer,
    NomenclatureCategorySerializer,
    NomenclatureSerializer,
    OrderSerializer,
    SwitchSerializer,
    UserSerializer,
    CartTo1CSerializer
)
from .models import Cart, Category, Item, Like, Comment, CartItem, Nomenclature, NomenclatureCategory, Order
from search.views import PaginatedElasticSearchAPIView
from search.documents import ItemDocument
from elasticsearch_dsl import Q
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .functions import get_daughter_nomenclatures, get_nomenclatures
from django.db.models import F, Sum
from django.db.models import Q as Query
from users.tasks import update_user_1c, create_order_1c
import httpx


User = get_user_model()

#todo list - подумать над админкой, форматом хранения файлов, интеграцией кэша, тестами, заняться заказами в 1С (попробовать сделать работающий HTTP сервис)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = CustomPagination
    permissions = (permissions.AllowAny, )
    filter_backends = [filters.SearchFilter]
    search_fields = ("title",)

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter("page_size", openapi.IN_QUERY, type=openapi.TYPE_NUMBER),
            openapi.Parameter("page", openapi.IN_QUERY, type=openapi.TYPE_NUMBER),
            # openapi.Parameter("wrapper", openapi.IN_QUERY, type=openapi.TYPE_BOOLEAN)
        ]
    )
    @action(
        methods=["GET"],
        detail=True,
        url_path="items",
        pagination_class=CustomPagination,
        serializer_class=ItemSerializer
    )
    def get_items(self, request, pk):
        category = Category.objects.get(id=pk)
        # if category.daughter.count() != 0:
        #     daughter_categories = category.daughter.all()
        #     base_query = Item.objects.none()
        #     for category in daughter_categories:
        #         base_query |= Item.objects.filter(nomenclature__in=category.nomenclatures.all()).all()
        #     items= base_query
        # else:
        #     items = Item.objects.filter(nomenclature__in=category.nomenclatures.all()).all()
        nomenclatures = get_daughter_nomenclatures(category.nomenclatures.all())
        items=  Item.objects.filter(nomenclature__in=nomenclatures).all()
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
            "multi_match", query=query, fields=["title", "category"], fuzziness="auto"
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    @action(detail=False, methods=["GET"], url_path="search/(?P<queryset>.*)")
    def search(self, request, queryset=None):
        try:
            query = self.generate_q_expression(queryset)
            search = self.document_class.search().query(query)
            total = search.count()
            response = search[0:total].to_queryset()
            results = self.paginate_queryset(response)
            serializer = self.serializer_class(results, context={"request": request}, many=True)
            return self.get_paginated_response(serializer.data)
        except Exception as e:
            return Response(e, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=["GET"], url_path="by_article/(?P<article>.+)")
    def get_by_article(self, request, article):
        try:
            item = Item.objects.filter(article=article).first()
            return Response(self.serializer_class(instance=item, context={"request": request}).data)
        except Exception as e:
            return Response({"detail": "Did not found any items with that article"}, status=status.HTTP_404_NOT_FOUND)

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
    def add_to_cart(self, request, pk):
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
    

    @swagger_auto_schema(
        request_body=ItemCartAmountSerialzier(),
        responses={201: CartItemSerializer()}
    )
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
        
        item = Item.objects.get(id=pk)
        cart_item = CartItem.objects.filter(cart__in=(Cart.objects.filter(user=request.user).filter(current_cart=True))).filter(item=item).first()

        if cart_item is None:
            return Response({"detail": "This item is not currently in cart!"}, status=status.HTTP_400_BAD_REQUEST)
        
        cart_item.amount = amount.validated_data["amount"]
        cart_item.save()

        return Response(CartItemSerializer(instance=cart_item, context={"request": request}).data)


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
        
        bought  = CartItem.objects.filter(cart__in=(Cart.objects.filter(user=self.request.user).filter(bought=True).all())).values_list("item_id", flat=True).distinct()

        if int(comment.initial_data["item"]) not in bought:
            return Response(
                {"detail": "You cant comment this item yet"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        comment.save(user=self.request.user)
        return Response(comment.data, status=status.HTTP_201_CREATED)


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
            # update_user_1c(request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors)

    @action(
        detail=False,
        methods=["GET"],
        permission_classes=(permissions.IsAuthenticated,),
        url_path="me/cart",
        serializer_class=CartSerializer,
    )
    def my_cart(self, request): #Убрать количество наверное
        current_cart = (
            Cart.objects.filter(bought=False)
            .filter(current_cart=True)
            .filter(user=self.request.user)
            .first()
        )
        if current_cart is None:
            return []
        serializer = self.serializer_class(instance=current_cart, context={"request": request})
        return Response(serializer.data)


class AdminNomenclaturesViewSet(viewsets.GenericViewSet, mixins.UpdateModelMixin):
    serializer_class = NomenclatureSerializer
    queryset = Nomenclature.objects.all()
    permission_classes = (permissions.AllowAny,) #only admin
    pagination_class = CustomPagination

    @swagger_auto_schema(manual_parameters=[
            openapi.Parameter('level_of_nesting', openapi.IN_QUERY, description='Уровень вложенности, дефолт = 0', type=openapi.TYPE_INTEGER),
            openapi.Parameter("page_size", openapi.IN_QUERY, type=openapi.TYPE_NUMBER),
            openapi.Parameter("page", openapi.IN_QUERY, type=openapi.TYPE_NUMBER),
        ])
    def list(self, request):
        level_of_nesting = int(request.GET['level_of_nesting']) if 'level_of_nesting' in request.GET else 0
        nomenclatures = get_nomenclatures(level_of_nesting)
        page = self.paginate_queryset(nomenclatures)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(nomenclatures, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=NomenclatureCategorySerializer(many=True),
        responses={201: NomenclatureCategorySerializer(many=True)}
    )        
    @action(methods=['POST'], url_path='add_to_category', detail=False, serializer_class=NomenclatureCategorySerializer)
    def add_nomenclature_to_category(self, request):
        """
        Связывает номенклатуру с категорий. В этом роуте можно добавлять сразу много номенклатур/категорий, чтобы не делать много запросов и оптимизировать все запросы к БД. Просто передаешь их через массив
        """
        serializer = self.get_serializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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

        cart = Cart.objects.filter(bought=False).filter(current_cart=True).filter(user=self.request.user).first()
        if cart is None:
            raise ValidationError("Невозможно создать заказ с пустой корзиной!")
        
        items_for_order = cart.items.filter(marked_for_order=True)

        total_sum = items_for_order.aggregate(total=Sum(F("item__price") * F("amount")))["total"]
        if total_sum == 0:
            raise ValidationError("Невозможно создать заказ с пустой корзиной!")
            
        aviable_to_create = items_for_order.filter(amount__lte=Sum("item__remains__count")).count() == items_for_order.count()
        if not aviable_to_create:
            raise ValidationError("Невозможно создать заказ. Не хватает товаров на складе")
        
        #Также надо будет создать проверку на место, куда будет доставляться заказ, не выходит ли за пределы калейдоскопа + сделать генерацию адресов, может быть стоит создат новую модель address, в которой будет храниться отдельно все значения для генерации адреса в Яндекс Картах, а также экспорта в 1С.    

        order_cart = Cart.objects.create(user=request.user, current_cart=False)
        order_cart.items.add(*items_for_order.all())
        
        cart_serializer = CartTo1CSerializer(instance=order_cart)
        
        try: 
            response = create_order_1c(cart_serializer, request.user)
        except httpx.TimeoutException:
            return Response({"detail": "Запущено в режиме отладки"})
        except Exception as e:
            return Response(e, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # finally:
        #     cart.items.add(*order_cart.items.all())
        #     order_cart.delete()

        instance = order.save(user=self.request.user, code=response["code"])
        return Response(self.get_serializer(instance=instance))
    