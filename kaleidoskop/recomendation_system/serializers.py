from rest_framework import serializers
from api.models import Item, Like, CartItem, Cart
from api.serializers import ItemSerializer
class ItemToAIModel(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ('id', 'title')


class ItemFromAISerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all(), write_only=True)
    item = ItemSerializer(read_only=True)
    similarity_score = serializers.FloatField()
    rank = serializers.IntegerField()

    def create(self, validated_data):
        item = validated_data.pop("product_id")  # здесь уже instance Item
        return {
            "item": item,
            "similarity_score": validated_data["similarity_score"],
            "rank": validated_data["rank"],
        }
    
    def to_representation(self, instance):
        if isinstance(instance, dict) and "product_id" in instance and "item" not in instance:
            obj = instance["product_id"]
            if not isinstance(obj, Item):
                obj = Item.objects.get(pk=obj)
            instance = {
                "item": obj,
                "similarity_score": instance["similarity_score"],
                "rank": instance["rank"],
            }
        return super().to_representation(instance)