from django.test import TestCase
from services.cart_item_service import CartItemService
from services.cart_service import CartService
from api.models import CartItem, Item
from django.contrib.auth import get_user_model
from exceptions.exceptions import EmailIsNotFree, OTPTimedOutException, WrongOTPPassedException

User = get_user_model()

class TestCartService(TestCase):
    def setUp(self):
        self.user = User.objects.create(email="test@test.ru")
        self.cart = CartService().get_cart_by_user(self.user.pk)
        self.cart_item_service = CartItemService()
        self.item = Item.objects.create(
            title='Тестовый товар',
            article='ART001',
            code='CODE001',
            price=100.0,
            volume_UOM='мл',
            volume_size=500.0,
            UOM='шт',
            weight_usage=False,
            barcode='Something2',
            country='Россия',
            public=True
        )
        self.another_item = Item.objects.create(
            title='Проба',
            article='ART002',
            code='CODE002',
            price=50.0,
            volume_UOM='мл',
            volume_size=1000.0,
            UOM='шт',
            weight_usage=False,
            country='Китай',
            barcode='Something',
            public=True
        )
        
    
    def test_empty_cart(self):
        """Тест на пустую корзину"""
        
        item_of_cart = self.cart_item_service.get_item_of_cart(self.item, self.cart)
        count_of_cart = self.cart_item_service.get_cart_count(self.item, self.user.pk)
        
        another_item_of_cart = self.cart_item_service.get_item_of_cart(self.another_item, self.cart)
        another_count_of_cart = self.cart_item_service.get_cart_count(self.another_item, self.user.pk)
        
        self.assertEqual(item_of_cart, None)
        self.assertEqual(count_of_cart, None)
        self.assertEqual(another_item_of_cart, None)
        self.assertEqual(another_count_of_cart, None)

    def test_add_one_item(self):
        """Тест на добавление одного предмета"""
        
        self.cart_item_service.create_or_delete_cart_item(self.item, self.cart, True)      
        
        item_of_cart = self.cart_item_service.get_item_of_cart(self.item, self.cart)
        count_of_cart = self.cart_item_service.get_cart_count(self.item, self.user.pk)
        
        another_item_of_cart = self.cart_item_service.get_item_of_cart(self.another_item, self.cart)
        another_count_of_cart = self.cart_item_service.get_cart_count(self.another_item, self.user.pk)

        self.assertNotEqual(item_of_cart, None)
        self.assertEqual(count_of_cart, 1)
        self.assertEqual(another_item_of_cart, None)
        self.assertEqual(another_count_of_cart, None)
        
    def test_both_items(self):
        """Тест на добавление двух предметов"""
        
        self.cart_item_service.create_or_delete_cart_item(self.item, self.cart, True)      
        self.cart_item_service.create_or_delete_cart_item(self.another_item, self.cart, True)         
        
        item_of_cart = self.cart_item_service.get_item_of_cart(self.item, self.cart)
        count_of_cart = self.cart_item_service.get_cart_count(self.item, self.user.pk)
        
        another_item_of_cart = self.cart_item_service.get_item_of_cart(self.another_item, self.cart)
        another_count_of_cart = self.cart_item_service.get_cart_count(self.another_item, self.user.pk)

        self.assertNotEqual(item_of_cart.pk, None)
        self.assertEqual(count_of_cart, 1)
        self.assertNotEqual(another_item_of_cart, None)
        self.assertEqual(another_count_of_cart, 1)
        
    def test_rule_cart_items(self):
        """Тест на управление предметом в корзине"""

        cart_item = self.cart_item_service.create_or_delete_cart_item(self.item, self.cart, True)
        self.assertEqual(cart_item, True)
        self.assertEqual(CartItem.objects.all().exists(), True)
        
        cart_item = self.cart_item_service.create_or_delete_cart_item(self.item, self.cart, False)
        self.assertEqual(cart_item, False)
        self.assertEqual(CartItem.objects.all().exists(), False)
          
        cart_item = self.cart_item_service.create_or_delete_cart_item(self.item, self.cart, False)
        self.assertEqual(cart_item, False)
        self.assertEqual(CartItem.objects.all().exists(), False)
          
    def test_update_amount_of_cart(self):
        """Тест на изменение количества в корзине"""
        
        self.cart_item_service.create_or_delete_cart_item(self.item, self.cart, True)
        cart_item = CartItem.objects.first()
        self.cart_item_service.update_amount_of_cart_item(cart_item, 15)
        cart_item.refresh_from_db()
        self.assertEqual(cart_item.amount, 15)
        
        self.cart_item_service.update_amount_of_cart_item(cart_item, -15)
        cart_item.refresh_from_db()
        self.assertEqual(cart_item.amount, 0)
    
    def test_mark_for_order(self):
        """Тест на пометку заказа в корзине"""
        
        self.cart_item_service.create_or_delete_cart_item(self.item, self.cart, True)      
        self.cart_item_service.create_or_delete_cart_item(self.another_item, self.cart, True)         

        ids = list(CartItem.objects.all().values_list('id', flat=True))
        self.cart_item_service.update_cart(ids, True)
        
        for cart_item in CartItem.objects.all():
            self.assertEqual(cart_item.marked_for_order, True)
