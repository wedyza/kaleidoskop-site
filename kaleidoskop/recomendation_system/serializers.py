from rest_framework import serializers
from api.models import Item

class ItemToAIModel(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ('id', 'title')