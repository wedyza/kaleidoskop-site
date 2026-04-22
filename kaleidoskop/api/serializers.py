from rest_framework import serializers
from .models import Banner, Brand, Category, Item, Cart, CartItem, ItemImage, Like, Comment, Order, Parameter, ParameterItem, Remains, Shop
from django.contrib.auth import get_user_model
from django.db.models import Sum
from admin_panel.models import Compilation
from services.category_service import CategoryService
from services.like_service import LikeService
from services.cart_item_service import CartItemService
from services.item_service import ItemService
from services.nomenclature_service import NomenclatureService
from services.compilation_service import CompilationService

User = get_user_model()

category_service = CategoryService()
like_service = LikeService()
cart_item_service = CartItemService()
item_service = ItemService()
nomenclature_service = NomenclatureService()
compilation_service = CompilationService()


class CategoryListSerializer(serializers.ModelSerializer):
    parent = "self"
    
    class Meta:
        model = Category
        fields = ('title', 'id', 'parent', 'image', 'slug')


class CategoryDetailSerializer(serializers.ModelSerializer):
    parent = "self"
    items_count = serializers.SerializerMethodField('get_items_count')

    class Meta:
        model = Category
        fields = ('title', 'id', 'parent', 'image', 'slug', 'items_count')
        read_only_fields = ('id', 'slug', 'items_count')

    def get_items_count(self, obj) -> int:
        return category_service.count_category_items(obj.id)


class ItemRemainsSerializer(serializers.ModelSerializer):
    warehouse = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Remains
        fields = ("warehouse", "count")


class ItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ('source',)


class ParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parameter
        fields = ('title', 'unit')


class ParameterItemSerializer(serializers.ModelSerializer):
    parameter = ParameterSerializer(read_only=True)
    class Meta:
        model = ParameterItem
        fields = ('value', 'parameter')


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'


class ItemDetailSerializer(serializers.ModelSerializer):
    remains = serializers.SerializerMethodField("get_remains", read_only=True)
    in_wishlist = serializers.SerializerMethodField("get_in_wishlist", read_only=True)
    cart_count = serializers.SerializerMethodField("get_cart_count", read_only=True)
    images = ItemImageSerializer(many=True, read_only=True)
    parameters = ParameterItemSerializer(many=True, read_only=True)
    brand = BrandSerializer(read_only=True)
    associatives = serializers.SerializerMethodField("get_associatives", read_only=True)

    class Meta:
        model = Item
        fields = (
            "id",
            "title",
            "description",
            "price",
            "article",
            "country",
            "remains",
            "slug",
            "in_wishlist",
            "cart_count",
            'images',
            'parameters',
            'brand',
            'associatives'
        )

    
    def get_in_wishlist(self, obj) -> bool:
        user = self.context["request"].user
        if user.is_anonymous:
            return False
        return like_service.is_user_liked_item(user.pk, obj.id)

    def get_cart_count(self, obj) -> int:
        user = self.context["request"].user
        if user.is_anonymous:
            return None
        return cart_item_service.get_cart_count(obj, user.pk)
            
    def get_remains(self, obj: Item) -> int: # Не знаю, насколько это надо кэшировать.
        return item_service.get_item_remains(obj)
    
    def get_associatives(self, obj: Item) -> list:
        if obj.nomenclature.associative:
            return ItemListSerializer(
                instance=nomenclature_service.get_items_from_associative_nomenclature(obj.id),
                many=True, 
                context=self.context
            ).data
        return []

class ItemListSerializer(ItemDetailSerializer):
    class Meta:
        model = Item
        fields = (
            "id",
            "title",
            "price",
            "article",
            "slug",
            "in_wishlist",
            "cart_count",
            'images',
        )

    def get_in_wishlist(self, obj) -> bool:
        user = self.context["request"].user
        if user.is_anonymous:
            return False
        return like_service.is_user_liked_item(user.pk, obj.id)

    def get_cart_count(self, obj) -> int:
        user = self.context["request"].user
        if user.is_anonymous:
            return None
        return cart_item_service.get_cart_count(obj, user.pk)

class CartItemSerializer(serializers.ModelSerializer):
    item = ItemDetailSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ("item", 'id', 'amount', 'marked_for_order')
        read_only_fields = ('item',)


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ("items",)


class LikeSerializer(serializers.ModelSerializer):
    item = ItemListSerializer()

    class Meta:
        model = Like
        fields = ("item", )


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = "__all__"


class SwitchSerializer(serializers.Serializer):
    enable = serializers.BooleanField()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "email", "sex", "avatar", "is_superuser", "phone_number", "middle_name")
        read_only_fields = ('id', 'is_superuser')

class AddressSerializer(serializers.Serializer):
    city = serializers.CharField(required=True)
    street = serializers.CharField(required=True)
    house = serializers.CharField(required=True)
    entrance = serializers.IntegerField(required=False)
    floor = serializers.IntegerField(required=False, allow_null=True)
    apartment = serializers.IntegerField(required=False, allow_null=True)


class OrderSerializer(serializers.ModelSerializer):
    address = AddressSerializer(write_only=True, required=False)
    shop = serializers.PrimaryKeyRelatedField(queryset=Shop.objects.all(), required=False, write_only=True)
    cart = CartSerializer(read_only=True, required=False)

    class Meta:
        model = Order
        exclude = ("total_price",)
        read_only_fields = ("user", "cart", "id", "code", "status", 'created_at')

    def create(self, validated_data):
        validated_data.pop('shop', None)
        validated_data.pop('address', None)
        return super().create(validated_data)

    def validate(self, attrs):
        delivery_method = attrs.get('delivery_method')
        address = attrs.get('address')
        shop = attrs.get('shop')

        errors = {}

        if delivery_method == Order.DeliveryMethods.DELIVERY:
            if not address:
                errors['address'] = ['Это обязательно поле для delivery_method Доставка']

        else:
            if not shop:
                errors['shop'] = ['Это обязательно поле для delivery_method Самовывоз']
        
        if shop and address:
            errors['address'] = ['Нельзя задавать это поле совместно с shop!']
            errors['shop'] = ['Нельзя задавать это поле совместно с address!']

        if errors:
            raise serializers.ValidationError(errors)

        return super().validate(attrs)


class ListCartItemSerializer(serializers.Serializer):
    ids = serializers.ListField(
        child=serializers.UUIDField()
    )
    enable = serializers.BooleanField()


class OrderItemTo1CSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ("code", "price")


class OrderCartItemsTo1CSerializer(serializers.ModelSerializer):
    item = OrderItemTo1CSerializer()

    class Meta:
        model = CartItem
        fields = ("item", "amount")


class CartTo1CSerializer(serializers.ModelSerializer):
    items = OrderCartItemsTo1CSerializer(many=True)

    class Meta:
        model = Cart
        fields = ("items", )

class ItemCartAmountSerialzier(serializers.Serializer):
    amount = serializers.IntegerField()


class ShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = '__all__'


class PublicBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ('source', )


class PublicCompilationSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField('get_items')
    class Meta:
        model = Compilation
        fields = ('items', 'title', 'start_time', 'end_time')
        read_only_fields = ['items', 'title', 'start_time', 'end_time']
    
    def get_items(self, obj):
        return compilation_service.get_compilation_items(obj.pk)
