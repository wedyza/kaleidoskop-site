from rest_framework import serializers
from .models import Banner, Brand, Category, Item, Cart, CartItem, ItemImage, Like, Comment, NomenclatureCategory, Order, Parameter, ParameterItem, Remains, Nomenclature, Shop
from django.contrib.auth import get_user_model
from .functions import get_daughter_nomenclatures

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    parent = "self"
    items_count = serializers.SerializerMethodField('get_items_count')

    class Meta:
        model = Category
        fields = ('title', 'id', 'parent', 'slug', 'items_count')
        read_only_fields = ('id', 'slug', 'items_count')

    def get_items_count(self, obj):
        nomenclatures = get_daughter_nomenclatures(obj.nomenclatures.all())
        return Item.objects.filter(nomenclature__in=nomenclatures).count()


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


class ItemSerializer(serializers.ModelSerializer): # Завтра проверить характеристики, также подключить их для фильтров в категории?
    remains = ItemRemainsSerializer(many=True, read_only=True)
    in_wishlist = serializers.SerializerMethodField("get_in_wishlist", read_only=True)
    cart_count = serializers.SerializerMethodField("get_cart_count", read_only=True)
    images = ItemImageSerializer(many=True, read_only=True)
    parameters = ParameterItemSerializer(many=True, read_only=True)
    brand = BrandSerializer(read_only=True)
    # discount = serializers.SerializerMethodField('get_discount', read_only=True)

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
        )  # тут на основе некоторых полей, надо будет решать возвращать / не возвращать значения

    
    def get_in_wishlist(self, obj):
        user = self.context["request"].user
        if user.is_anonymous:
            return False
        
        wishlist = Like.objects.filter(user=user).filter(item=obj).first()

        return not wishlist is None

    def get_cart_count(self, obj):
        user = self.context["request"].user
        if user.is_anonymous:
            return None
        
        cart_item = CartItem.objects.filter(cart__in=(Cart.objects.filter(user=user).filter(current_cart=True))).filter(item=obj).first()

        if cart_item is None:
            return cart_item
        return cart_item.amount

    def get_discount(self, obj):
        if obj.price_group == Item.PriceGroup.NOTHING or obj.price_group is None:
            return 0
        elif obj.price_group == Item.PriceGroup.THIRD:
            return 3
        elif obj.price_group == Item.PriceGroup.FIRST:
            return 1
        elif obj.price_group == Item.PriceGroup.SECOND:
            return 2
        elif obj.price_group == Item.PriceGroup.FOURTH:
            return 4
        return 5


class CartItemSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)

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
    item = ItemSerializer()

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
        fields = ("id", "first_name", "last_name", "email", "sex", "avatar", "is_superuser", "phone_number", "middle_name")  # avatar
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
        shop = validated_data.pop('shop', None)
        address_data = validated_data.pop('address', None)
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


# class BrandSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Brand
#         fields = '__all__'


class PublicBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ('source', )