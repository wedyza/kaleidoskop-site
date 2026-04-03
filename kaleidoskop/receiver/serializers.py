from rest_framework import serializers
from api.models import Category, Item, Nomenclature, Remains, Warehouse
from rest_framework.exceptions import ValidationError
from .functions import get_or_create_item, get_or_create_remain


class NomenclatureCreateSerializer(serializers.ModelSerializer):
    parent_code = serializers.CharField(allow_null=True)

    class Meta:
        model = Nomenclature
        fields = ("title", "code", "parent", "parent_code")
        read_only_fields = ("parent",)


class ItemListCreateSerializer(serializers.ListSerializer):
    def create(self, validated_data):
        items_to_update = []
        items_to_create = []
        unique_list = []
        created_items = []

        for item in validated_data:
            if not (item["code"] in unique_list or item["article"] in unique_list):
                unique_list.append(item["code"])
                unique_list.append(item["article"])
            else:
                created_items.extend(Item.objects.bulk_create(items_to_create))
                items_to_create = []
            real_one, created = get_or_create_item(item)
            if created:
                items_to_create.append(real_one)
            else:
                items_to_update.append(real_one)

        created_items.extend(Item.objects.bulk_create(items_to_create))
        Item.objects.bulk_update(
            items_to_update,
            fields=["title", "parent_code", "nomenclature", "price", "article"],
        )
        return created_items


class ItemCreateSerializer(serializers.ModelSerializer):
    parent_code = serializers.CharField(allow_null=True)
    code = serializers.CharField()
    article = serializers.CharField()

    class Meta:
        model = Item
        list_serializer_class = ItemListCreateSerializer
        fields = (
            "title",
            "article",
            "price",
            "volume_UOM",
            "volume_size",
            "UOM",
            "weight_usage",
            "weight_UOM",
            "weight_size",
            "country",
            "code",
            "parent_code",
        )


class ListRemainsReceiveSerializer(serializers.ListSerializer): # Тут удобная логика обработки приемки, к сожалению, как костыль пока-что оставлю
    def create(self, validated_data):
        remains_to_update = []
        remains_to_create = []

        for remain in validated_data:
            another_remain, is_created = get_or_create_remain(remain)
            if another_remain is None:
                continue
            if is_created:
                remains_to_create.append(another_remain)
            else:
                remains_to_update.append(another_remain)
        created_remains = Remains.objects.bulk_create(
            remains_to_create, ignore_conflicts=True
        )
        Remains.objects.bulk_update(remains_to_update, ["count"])
        return created_remains


class RemainsReceiveSerializer(serializers.Serializer):
    code = serializers.CharField()
    warehouse = serializers.CharField()
    order = serializers.CharField()
    count = serializers.FloatField()

    class Meta:
        list_serializer_class = ListRemainsReceiveSerializer

    def validate_count(self, value):
        if value < 0:
            return 0
        return value

    def validate(self, data):
        code = data.get("code")
        count = data.get("count")
        warehouse_name = data.get("warehouse")

        try:
            warehouse = Warehouse.objects.get(name=warehouse_name)
        except Warehouse.DoesNotExist:
            raise serializers.ValidationError(
                f"Склад с именем \"{warehouse_name}\" не найден"
            )

        if count < 0:
            data["count"] = 0
        return data


class UpdateRemainsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Remains
        fields = '__all__'


class OrderReceiveSerializer(serializers.Serializer):
    code = serializers.CharField()
    status = serializers.CharField()
    agreed = serializers.CharField()