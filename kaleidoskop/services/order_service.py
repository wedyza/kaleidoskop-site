from uuid import UUID
from services.user_service import UserService
from services.cart_service import CartService
from services.async_service import AsyncService
from repositories.order_repository import OrderRepository
from users.models import CustomAbstractUser
from typing import Iterable
from exceptions.exceptions import OrderIsAgreed, UnknownUserException, EmptyCartException, ExceededRemainsException, UserUnauthorized
from api.models import Order, Cart, Item
from api.serializers import OrderSerializer, CartTo1CSerializer
from services.integration_service import IntegrationService
from django.conf import settings
from django.utils import timezone

class OrderService: 
    _user_service = UserService()
    _order_repository = OrderRepository()
    _cart_service = CartService()
    _integration_service = IntegrationService()
    _async_service = AsyncService()
    _LOCAL_TZ = settings.LOCAL_TZ
    
    def update_order_status(self, code: str, status: str):
        order = self.get_order_by_code(code)
        reformed_status = Order.OrderStatus.APPROVED
        match status:
            case 'Закрыт':
                reformed_status = Order.OrderStatus.REALISED
            case 'На согласовании':
                reformed_status = Order.OrderStatus.ON_APPROVE
            case 'К выполнению / В резерве':
                reformed_status = Order.OrderStatus.ON_REALISATION
            case 'Отменен':
                reformed_status = Order.OrderStatus.CANCELED
        self._order_repository.update_order_status(order, reformed_status)
    
    def get_order_by_code(self, code: str) -> Order:
        return self._order_repository.get_order_by_code(code)
    
    def get_order_queryset(self, user_pk: UUID) -> Iterable[Order]:
        return Order.objects.filter(user_id=user_pk).all()
    
    def __validate_user(self, user: CustomAbstractUser) -> bool:
        if user.code is None or user.first_name is None or user.phone_number is None:
            raise UnknownUserException
        return True
        
    def __validate_cart(self, items_for_order: Iterable[Item]) -> float:
        if items_for_order.count() == 0:
            raise EmptyCartException
        total_sum = self._order_repository.validate_cart(items_for_order)
        if total_sum == 0 or total_sum is None:
            raise EmptyCartException
        if self._order_repository.validate_item_remains(items_for_order):
            raise ExceededRemainsException(item_list=self._order_repository.get_exceeded_items(items_for_order))
        return total_sum
        
    def __validate_order(self, user: CustomAbstractUser, items_for_order: Iterable[Item]) -> float:
        total_sum = self.__validate_cart(items_for_order) 
        self.__validate_user(user)
        return total_sum
    
    def __create_cart(self, user: CustomAbstractUser, items_for_order: Iterable[Item]) -> Cart:
        cart = self._cart_service.create_empty_cart_for_user(user)
        cart.items.add(*items_for_order.all())
        return cart
    
    def __fill_order_data_to_1C(self, order_cart: Cart, user: CustomAbstractUser, order_data: OrderSerializer) -> dict[str, str]:
        cart_1c_serializer = CartTo1CSerializer(instance=order_cart)
        if order_data.validated_data['delivery_method'] == 'Доставка':
            address_data = order_data.validated_data['address']
        else:
            shop = order_data.validated_data['shop']
            address_data = {
                'city': shop.city,
                'street': shop.street,
                'house': shop.house
            }
        return cart_1c_serializer.data | {
            'address': address_data,
            'payment_method': order_data.validated_data['payment_method'],
            'delivery_type': order_data.validated_data['delivery_method'], 
            'user_code': user.code
        }
    
    def __create_order(self, user: CustomAbstractUser, items_for_order: Iterable[Item], order_data: OrderSerializer, cart: Cart, total_sum: float) -> Order:
        order_cart = self.__create_cart(user, items_for_order)
        data_to_1C = self.__fill_order_data_to_1C(order_cart, user)        
        response = self._integration_service.create_order_1c(data_to_1C)
        return self._order_repository.save_order_and_update_order_cart(order_data, cart, response['code'], total_sum, user)
    
    def delete_order(self, user_pk: UUID, order_pk: UUID) -> bool:
        user = self._user_service.get_user_by_id(user_pk)
        order = self._order_repository.get_order_by_code(order_pk)
        if user != order.user:
            raise UserUnauthorized
        
        if order.status == Order.OrderStatus.SENDED:
            self._integration_service.delete_order_1c(order.code)
            self._order_repository.delete_order(order)
            return True
        raise OrderIsAgreed
    
    def create_order(self, user_pk: UUID, order_data: OrderSerializer) -> Order:
        # Обернуть это всё в транзакцию
        user = self._user_service.get_user_by_id(user_pk)
        cart = self._cart_service.get_cart_by_user(user)
        items_for_order = self._order_repository.get_items_for_order(cart)
        total_sum = self.__validate_order(user, items_for_order)
        instance = self.__create_order(user, items_for_order, order_data, cart, total_sum)
        self._async_service.produce_tg_notification(
            order_data={
                'code': instance.code,
                'created_at': timezone.now().astimezone(self._LOCAL_TZ).strftime("%d/%m/%Y, %H:%M:%S"),
                'user': {
                    'first_name': instance.user.first_name,
                    'last_name': instance.user.last_name,
                    'middle_name': instance.user.middle_name,
                    'phone_number': instance.user.phone_number
                },
                'delivery_type': instance.delivery_method
            }
        )
        return instance
