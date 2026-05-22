from typing import Union, List
from api.models import CartItem, Category, Item
from repositories.item_repository import ItemRepository
from .like_service import LikeService
from .cart_item_service import CartItemService
from .cart_service import CartService
from exceptions.exceptions import NotFoundException
from uuid import UUID
from django.db.models import QuerySet

class ItemService:
    _like_service = LikeService()
    _item_repository = ItemRepository()
    _cart_item_service = CartItemService()
    _cart_service = CartService()
    
    def create_new_items(self, data: dict[str, str]):
        created = self._item_repository.create_new_items(data)
        if created:
            self._item_repository.fillup_items_with_parents()
    
    def get_item_by_id(self, item_pk: UUID) -> Item:
        try:
            return self._item_repository.get_item_by_id(item_pk)
        except:  # noqa: E722
            raise NotFoundException
    
    def switch_wishlist_to_item(self, item_pk:UUID, user_pk: UUID, status: bool) -> bool:
        return self._like_service.switch_like(item_pk, user_pk, status)

    def add_item_to_cart(self, item_pk: UUID, user_pk: UUID, status: bool) -> bool:
        cuurent_cart = self._cart_service.get_cart_by_user(user_pk)
        item = self.get_item_by_id(item_pk)
        return self._cart_item_service.create_or_delete_cart_item(item, cuurent_cart, status)
    
    def update_cart_item_amount(self, item_pk: UUID, user_pk: UUID, amount: int) -> CartItem:
        item = self.get_item_by_id(item_pk)
        current_cart = self._cart_service.get_cart_by_user(user_pk)
        cart_item = self._cart_item_service.get_item_of_cart(item, current_cart)
        if cart_item is None:
            raise NotFoundException
        return self._cart_item_service.update_amount_of_cart_item(cart_item, amount)

    def find_by_ids(self, ids: list[str]) -> Union[QuerySet, List[Item]]:
        return self._item_repository.find_by_ids(ids)
    
    def find_by_query(self, query: str) -> Union[QuerySet, List[Item]]:
        return self._item_repository.find_by_query(query)

    def get_recommended_items_queryset(self, item_pk: UUID) -> Union[QuerySet, List[Item]]: # 
        # item = self.get_item_by_id(item_pk)
        return self._item_repository.get_recommended_items_by_item_title(pk=item_pk)

    def get_item_remains(self, item: Item) -> int:
        return self._item_repository.get_item_remains(pk=item.id)
    
    def find_by_slug(self, slug: str) -> Item:
        return self._item_repository.find_by_slug(slug)
