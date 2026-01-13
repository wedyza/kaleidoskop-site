from rest_framework import filters

class IsAssignedFilter(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        if request.query_params.get('assigned') == 'true':
            return queryset.exclude(categories=None)
        elif request.query_params.get('assigned') == 'false':
            return queryset.filter(categories=None)
        return queryset