from api.models import CartItem, Item, Cart
from typing import List
from uuid import UUID

class CartItemRepository:
    def get_item_of_cart(self, item: Item, cart: Cart) -> CartItem | None:
        return CartItem.objects.filter(item=item).filter(cart=cart).first()
    
    def create_cart_item(self, item: Item, cart: Cart) -> CartItem:
        cart_item = CartItem.objects.create(cart=cart, item=item, amount=1)
        cart_item.save()
        return cart_item
    
    def update_amount_of_cart_item(self, cart_item: CartItem, amount: int) -> CartItem:
        cart_item.amount = amount
        cart_item.save()
        return cart_item
    
    def update_cart(self, ids: List[UUID], enable: bool):
        CartItem.objects.filter(id__in=ids).update(marked_for_order=enable)