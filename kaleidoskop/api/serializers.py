from rest_framework import serializers
from .models import Category, Item, Cart, CartItem, Like, Comment, NomenclatureCategory, Order, Remains, Nomenclature
from django.contrib.auth import get_user_model

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    parent = "self"

    class Meta:
        model = Category
        exclude = ('nomenclatures', )


class ItemRemainsSerializer(serializers.ModelSerializer):
    warehouse = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Remains
        fields = ("warehouse", "count")


class ItemSerializer(serializers.ModelSerializer):
    remains = ItemRemainsSerializer(many=True, read_only=True)

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
        )  # тут на основе некоторых полей, надо будет решать возвращать / не возвращать значения


class CartItemSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ("item", "amount", 'id')


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ("items",)


class LikeSerializer(serializers.ModelSerializer):
    item = ItemSerializer()

    class Meta:
        model = Like
        fields = "__all__"


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = "__all__"


class SwitchSerializer(serializers.Serializer):
    enable = serializers.BooleanField()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "email", "sex", "avatar")  # avatar


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