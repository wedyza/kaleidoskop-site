from rest_framework import serializers
from .models import Category, Item, Cart, CartItem, Like, Comment, Remains
from django.contrib.auth import get_user_model

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    parent = "self"

    class Meta:
        model = Category
        fields = "__all__"


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
            "category",
            "country",
            "remains",
        )  # тут на основе некоторых полей, надо будет решать возвращать / не возвращать значения


class CartItemSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ("item", "amount")


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
        fields = ("id", "first_name", "last_name", "email", "sex")  # avatar
