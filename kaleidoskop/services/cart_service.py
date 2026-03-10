from api.models import Cart
from repositories.cart_repository import CartRepository
from users.models import CustomAbstractUser
from uuid import UUID

class CartService:
    _cart_repository = CartRepository()

    def get_cart_by_user(self, user_pk: UUID) -> Cart:
        return self._cart_repository.get_or_create_user_cart(user_pk)
    
    def create_empty_cart_for_user(self, user: CustomAbstractUser) -> Cart:
        return self._cart_repository.create_empty_cart(user)
