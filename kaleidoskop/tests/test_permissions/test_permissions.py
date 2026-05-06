from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from tests.functions import user_create_closure
from api.permissions import IsUserHimself
from rest_framework import permissions

User = get_user_model()

create_user = user_create_closure()

class BasePermissionsTest(TestCase):
    def setUp(self):
        self.permission = IsUserHimself()
        self.auth_permission = permissions.IsAuthenticated()
        self.any_permission = permissions.AllowAny()
        self.admin_permission = permissions.IsAdminUser()
        self.user = create_user()
        self.user.is_active = True
        self.admin = create_user()
        self.admin.is_superuser = True
        self.admin.is_active = True
        self.factory = APIRequestFactory()
        

    def test_user_request_on_other_user(self):
        request = self.factory.get(f'users/{self.admin.id}/')
        request.user = self.user
        perms = self.permission.has_object_permission(request, None)
        self.assertFalse(perms)
