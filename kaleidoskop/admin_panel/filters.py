from rest_framework import filters
from rest_framework.request import Request
from django.db.models import QuerySet

class IsAssignedFilter(filters.BaseFilterBackend):
    def filter_queryset(self, request: Request, queryset: QuerySet, view):
        if request.query_params.get('assigned') == 'true':
            return queryset.exclude(categories=None)
        elif request.query_params.get('assigned') == 'false':
            return queryset.filter(categories=None)
        return queryset
    

class SubcategoryFilter(filters.BaseFilterBackend):
    def filter_queryset(self, request: Request, queryset: QuerySet, view):
        if request.query_params.get('subcategories') == 'true':
            return queryset.exclude(parent=None)
        elif request.query_params.get('subcategories') == 'false':
            return queryset.filter(parent=None)
        return queryset