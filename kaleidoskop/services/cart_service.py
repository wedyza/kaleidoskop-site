from api.models import Cart
from repositories.cart_repository import CartRepository
from uuid import UUID

class CartService:
    __cart_repository = CartRepository()

    def get_cart_by_user(self, user_pk: UUID) -> Cart:
        return self.__cart_repository.get_or_create_user_cart(user_pk)