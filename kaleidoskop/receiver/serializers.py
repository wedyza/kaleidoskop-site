from rest_framework import serializers
from api.models import Category, Item
from rest_framework.exceptions import ValidationError
from .functions import get_or_create_item

class CategoryCreateSerializer(serializers.ModelSerializer):
    parent_code = serializers.CharField(allow_null=True)
    
    class Meta:
        model = Category
        fields = ('title', 'code', 'parent', 'parent_code')
        read_only_fields = ('parent',)


class ItemListCreateSerializer(serializers.ListSerializer):
    def create(self, validated_data):
        items_to_update = []
        items_to_create = []
        for item in validated_data:
            real_one, created = get_or_create_item(item)
            if created:
                items_to_create.append(real_one)
            else:
                items_to_update.append(real_one)
        
        created = Item.objects.bulk_create(items_to_create)
        Item.objects.bulk_update(items_to_update, fields=['title', 'parent_code', 'category', 'price'])
        return created


class ItemCreateSerializer(serializers.ModelSerializer):
    parent_code = serializers.CharField(allow_null=True)
    code = serializers.CharField()
    article = serializers.CharField()

    class Meta:
        model = Item
        list_serializer_class = ItemListCreateSerializer
        fields = ('title', 'article', 'price', 'volume_UOM', 'volume_size', 'UOM', 'weight_usage', 'weight_UOM', 'weight_size', 'country', 'code', 'parent_code')