from django.conf import settings
from rest_framework import permissions


class ContainsAPIKey(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method != ["PUT"]:
            return True
        try:
            return request.headers["API_KEY"] == settings.API_KEY_1c
        except:
            return False


class AdminNonPut(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method == ["PUT"]:
            return True
        return request.user.is_authenticated and request.user.is_superuser