from api.models import CartItem
from repositories.item_repository import ItemRepository
from .like_service import LikeService
from .cart_item_service import CartItemService
from .cart_service import CartService
from kaleidoskop.exceptions.exceptions import NotFoundException
from uuid import UUID

class ItemService:
    __like_service = LikeService()
    __item_repository = ItemRepository()
    __cart_item_service = CartItemService()
    __cart_service = CartService()
    
    def create_new_items(self, data: dict[str, str]):
        created = self.__item_repository.create_new_items(data)
        if created:
            self.__item_repository.fillup_items_with_parents()
    
    def switch_wishlist_to_item(self, item_pk:UUID, user_pk: UUID, status: bool) -> bool:
        return self.__like_service.switch_like(item_pk, user_pk, status)

    def add_item_to_cart(self, item_pk: UUID, user_pk: UUID, status: bool) -> bool:
        cuurent_cart = self.__cart_service.get_cart_by_user(user_pk)
        item = self.__item_repository.get_item_by_id(item_pk)
        return self.__cart_item_service.create_or_delete_cart_item(item, cuurent_cart, status)
    
    def update_cart_item_amount(self, item_pk: UUID, user_pk: UUID, amount: int) -> CartItem:
        item = self.__item_repository.get_item_by_id(item_pk)
        current_cart = self.__cart_service.get_cart_by_user(user_pk)
        cart_item = self.__cart_item_service.get_item_of_cart(item, current_cart)
        if cart_item is None:
            raise NotFoundException
        return self.__cart_item_service.update_amount_of_cart_item(cart_item, amount)
