from uuid import UUID

from django.db.models import F, Sum
from typing import Union
from api.models import Item, Order, Cart
from users.models import CustomAbstractUser
from api.serializers import OrderSerializer
from exceptions.exceptions import NotFoundException
from django.db.models import QuerySet

class OrderRepository:
    def get_order_by_code(self, code: str) -> Order:
        order = Order.objects.filter(code=code).first()
        if order is None:
            raise NotFoundException
        return order
    
    def get_order_by_pk(self, pk: UUID) -> Order:
        return Order.objects.get(id=pk)

    def update_order_status(self, order: Order, status: Order.OrderStatus):
        order.status = status
        order.save()
            
    def get_items_for_order(self, cart: Cart) -> QuerySet:
        return cart.items.filter(marked_for_order=True)

    def validate_cart(self, items_for_order: QuerySet) -> float:
        total_sum = items_for_order.aggregate(total=Sum(F("item__price") * F("amount")))["total"]
        return total_sum
    
    def validate_item_remains(self, items_for_order: QuerySet) -> bool:
        return not items_for_order.filter(amount__lte=Sum("item__remains__count")).count() == items_for_order.count()

    def get_exceeded_items(self, items_for_order: QuerySet) -> QuerySet:
        return items_for_order.annotate(remains_sum=Sum("item__remains__count")).filter(amount__gt=F("remains_sum")).all()
    
    def save_order_and_update_order_cart(self, order: OrderSerializer, order_cart: Cart, code: str, total_price: float, user: CustomAbstractUser) -> Order:
        instance = order.save(user=user, code=code, total_price=total_price)
        order_cart.order = instance
        order_cart.save()
        return instance

    def delete_order(self, order: Order):
        order.delete()
