from typing import Iterable
from api.models import Cart
from uuid import UUID

class CartRepository:
    def get_or_create_user_cart(self, user_pk: UUID) -> Cart:
        cart = self.__get_user_cart(user_pk)
        if cart is None:
            return self.__create_user_cart(user_pk)
        
    def __get_user_cart(self, user_pk: UUID) -> Cart:
        return Cart.objects.filter(order=None).filter(current_cart=True).filter(user_id=user_pk).first()
    
    def __create_user_cart(self, user_pk: UUID) -> Cart:
        cart = Cart.objects.create(user_pk=user_pk)
        cart.save()
        return cart