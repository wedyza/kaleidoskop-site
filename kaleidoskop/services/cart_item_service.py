from api.models import CartItem, Item, Cart
from repositories.cart_item_repository import CartItemRepository
from services.cart_service import CartService
from uuid import UUID
from typing import List

class CartItemService:
    _cart_item_repository = CartItemRepository()
    _cart_service = CartService()
    
    def get_item_of_cart(self, item: Item, cart: Cart) -> CartItem | None:
        return self._cart_item_repository.get_item_of_cart(item, cart)
    
    def create_or_delete_cart_item(self, item: Item, cart: Cart, status: bool) -> bool:
        cart_item = self.get_item_of_cart(item, cart)
        if status and cart_item is None:
            self._cart_item_repository.create_cart_item(item, cart)
        elif not status and cart_item is not None:
            cart_item.delete()
        
        return status
    
    def update_amount_of_cart_item(self, cart_item: CartItem, amount: int) -> CartItem:
        return self._cart_item_repository.update_amount_of_cart_item(cart_item, amount)
    
    def update_cart(self, ids: List[UUID], enable: bool):
        self._cart_item_repository.update_cart(ids, enable)

    def get_cart_count(self, item: Item, user_pk: UUID) -> int:
        cart = self._cart_service.get_cart_by_user(pk=user_pk)
        return self.get_item_of_cart(item, cart).amount