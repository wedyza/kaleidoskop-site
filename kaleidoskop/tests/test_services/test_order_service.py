from django.test import TestCase
from unittest.mock import patch
from api.models import Cart, CartItem, Item, Remains, Warehouse
from api.serializers import OrderSerializer
from services.order_service import OrderService
from services.auth_service import AuthService
from django.utils.timezone import timedelta
from django.contrib.auth import get_user_model
from exceptions.exceptions import EmailIsNotFree, EmptyCartException, ExceededRemainsException, OTPTimedOutException, UnknownUserException, WrongOTPPassedException
import unittest

User = get_user_model()

class TestOrderService(TestCase):    
    def setUp(self):
        self.user = User.objects.create(email='test_email@gmail.com', code='001', first_name='known', last_name='name', phone_number='+79012300092')
        self.user.refresh_from_db()
        # self.user.phone_number = '+79012300092'
        # self.user.save()
        self.user_cart = Cart.objects.create(user=self.user, current_cart=True)
        self.item1 = Item.objects.create(
            title='Первый товар',
            article='ART003',
            code='CODE003',
            price=150.0,
            volume_UOM='мл',
            volume_size=250.0,
            UOM='шт',
            weight_usage=False,
            country='Италия',
            slug='первый-товар',
            barcode="SIXSEVEN",
            public=True
        )
        
        self.item2 = Item.objects.create(
            title='Второй товар',
            article='ART004',
            code='CODE004',
            price=200.0,
            volume_UOM='мл',
            volume_size=350.0,
            UOM='шт',
            weight_usage=False,
            country='Германия',
            slug='второй-товар',
            barcode="SIXSEVEN2",
            public=True
        )
        
        self.warehouse = Warehouse.objects.create(name='', custom_name='')
        
        self.order_data = OrderSerializer(data={
            "address": {
                "city": "string",
                "street": "string",
                "house": "string",
                "entrance": 0,
                "floor": 0,
                "apartment": 0
            },
            "delivery_method": "Доставка",
            "payment_method": "Наличными"
        })
        self.order_data.is_valid(raise_exception=True)
        
        self.order_service = OrderService()
        
    def add_item_to_cart(self, item: Item, amount = 1, marked = True) -> CartItem:
        return CartItem.objects.create(item=item, cart=self.user_cart, amount=amount, marked_for_order=marked)

    def add_remains_to_item(self, item: Item, amount = 1):
        Remains.objects.create(item=item, count=amount, warehouse=self.warehouse)

    @patch('services.async_service.AsyncService.produce_tg_notification')
    @patch('services.integration_service.IntegrationService.create_order_1c')
    def test_create_order_pass(self, mock_tg, mock_1c):
        """Успешное создание заказа"""

        mock_tg.return_value = {'code': '01'}
        mock_1c.return_value = {'code': '010101'} 
        
        self.add_remains_to_item(self.item1)
        self.add_item_to_cart(self.item1)
        self.add_remains_to_item(self.item2)
        self.add_item_to_cart(self.item2, 1, False)
                
        order = self.order_service.create_order(self.user.pk, self.order_data)

        self.assertIsNotNone(order)
        self.assertEqual(order.user, self.user)
        self.assertEqual(order.cart.items.count(), 1)
    
    @patch('services.async_service.AsyncService.produce_tg_notification')
    @patch('services.integration_service.IntegrationService.create_order_1c')
    def test_create_order_fail_exceeded_remains(self, mock_tg, mock_1c):
        """Создание заказа - недостаточно остатков"""
        
        mock_tg.return_value = {'code': '01'}
        mock_1c.return_value = {'code': '010101'} 

        self.add_item_to_cart(self.item1)
        self.add_item_to_cart(self.item2)

        try:    
            order = self.order_service.create_order(self.user.pk, self.order_data)
        except ExceededRemainsException:
            pass
        except Exception as e:
            raise e


    @patch('services.async_service.AsyncService.produce_tg_notification')
    @patch('services.integration_service.IntegrationService.create_order_1c')
    def test_create_order_fail_empty_cart(self, mock_tg, mock_1c):
        """Создание заказа - пустая корзина"""
        
        mock_tg.return_value = {'code': '01'}
        mock_1c.return_value = {'code': '010101'} 

        self.add_remains_to_item(self.item1)
        self.add_remains_to_item(self.item2)

        try:    
            order = self.order_service.create_order(self.user.pk, self.order_data)
        except EmptyCartException:
            pass
        except Exception as e:
            raise e

    @patch('services.async_service.AsyncService.produce_tg_notification')
    @patch('services.integration_service.IntegrationService.create_order_1c')
    def test_create_order_fail_unknown_user(self, mock_tg, mock_1c):
        """Создание заказа - неизвестный пользователь"""
        self.user.code = None
        self.user.save()

        mock_tg.return_value = {'code': '01'}
        mock_1c.return_value = {'code': '010101'} 

        self.add_remains_to_item(self.item1)
        self.add_item_to_cart(self.item1)
        self.add_remains_to_item(self.item2)
        self.add_item_to_cart(self.item2)

        try:    
            order = self.order_service.create_order(self.user.pk, self.order_data)
        except UnknownUserException:
            pass
        except Exception as e:
            raise e
    
    
    