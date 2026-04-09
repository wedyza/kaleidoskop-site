import django_filters as filters
from rest_framework import filters as rff
from rest_framework.request import Request
from django.db.models import QuerySet
from .models import Item, ItemImage

class ItemFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte', label='Min price')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte', label='Max price')
    brands = filters.BaseInFilter(field_name='brand__id', lookup_expr='in')

    class Meta:
        model = Item
        fields = ('min_price', 'max_price', 'brands') 
        
class ItemImageFilter(rff.BaseFilterBackend):
    def filter_queryset(self, request:Request, queryset:QuerySet, view):
        if request.query_params.get('with_images') == 'true':
            return queryset.filter(id__in=(ItemImage.objects.all().values_list('item_id', flat=True).distinct()))
        return queryset