from rest_framework import serializers
from .models import Category, Item, Cart, CartItem, ItemImage, Like, Comment, NomenclatureCategory, Order, Parameter, Remains, Nomenclature
from django.contrib.auth import get_user_model

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    parent = "self"

    class Meta:
        model = Category
        exclude = ('nomenclatures', )
        read_only_fields = ('id',)


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
        fields = ('title', 'unit', 'value')


class ItemSerializer(serializers.ModelSerializer):
    remains = ItemRemainsSerializer(many=True, read_only=True)
    in_wishlist = serializers.SerializerMethodField("get_in_wishlist", read_only=True)
    cart_count = serializers.SerializerMethodField("get_cart_count", read_only=True)
    images = ItemImageSerializer(many=True, read_only=True)
    parameters = ParameterSerializer(many=True, read_only=True)

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
            'parameters'
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
        fields = ("id", "first_name", "last_name", "email", "sex", "avatar", "is_superuser", "phone_number")  # avatar


class NomenclatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nomenclature
        fields = '__all__'


# class NomenclatureIDSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Nomenclature
#         fields = ('id',)


class NomenclatureCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NomenclatureCategory
        exclude = ('id',)


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        exclude = ("total_price",)
        read_only_fields = ("user", "cart", "id")


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