from api.models import Cart
from repositories.cart_repository import CartRepository
from users.models import CustomAbstractUser
from uuid import UUID
from api.decorators import cache_queryset

class CartService:
    _cart_repository = CartRepository()

    @cache_queryset('cart_of_user')
    def get_cart_by_user(self, pk: UUID) -> Cart:
        return self._cart_repository.get_or_create_user_cart(pk)
    
    def create_empty_cart_for_user(self, user: CustomAbstractUser) -> Cart:
        return self._cart_repository.create_empty_cart(user)
