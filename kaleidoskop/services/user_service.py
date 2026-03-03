from typing import Iterable
from django.contrib.auth import get_user_model
from repositories.category_repository import CategoryRepository
from uuid import UUID

User = get_user_model()

class UserService:
    ...