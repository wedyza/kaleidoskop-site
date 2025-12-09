import django_filters as filters
from .models import Brand, Item

class ItemFilter(filters.FilterSet):
    #skidki
    #remains
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte', label='Min price')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte', label='Max price')
    brands = filters.BaseInFilter(field_name='brand__id', lookup_expr='in')

    class Meta:
        model = Item
        fields = ('min_price', 'max_price', 'brands')