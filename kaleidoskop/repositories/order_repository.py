from django.db.models import F, Sum
from typing import List, Iterable
from api.models import Item, Order, Cart
from users.models import CustomAbstractUser
from uuid import UUID
from api.serializers import OrderSerializer

class OrderRepository:
    def get_items_for_order(self, cart: Cart) -> Iterable[Item]:
        return cart.items.filter(marked_for_order=True)

    def validate_cart(self, items_for_order: Iterable[Item]) -> float:
        total_sum = items_for_order.aggregate(total=Sum(F("item__price") * F("amount")))["total"]
        return total_sum
    
    def validate_item_remains(self, items_for_order: Iterable[Item]) -> bool:
        return not items_for_order.filter(amount__lte=Sum("item__remains__count")).count() == items_for_order.count()

    def get_exceeded_items(self, items_for_order: Iterable[Item]) -> List[Item]:
        return items_for_order.annotate(remains_sum=Sum("item__remains__count")).filter(amount__gt=F("remains_sum")).all()
    
    def save_order_and_update_order_cart(self, order: OrderSerializer, order_cart: Cart, code: str, total_price: float, user: CustomAbstractUser) -> Order:
        instance = order.save(user=user, code=code, total_price=total_price)
        order_cart.order = instance
        order_cart.save()
        return instance
    
    def get_order_by_id(self, order_pk: UUID) -> Order:
        return Order.objects.get(id=order_pk)

    def delete_order(self, order: Order):
        order.delete()