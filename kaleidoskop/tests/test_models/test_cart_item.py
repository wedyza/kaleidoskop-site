from django.test import TestCase
from api.models import Item, Cart, Order, Like, CartItem, Warehouse, Banner, Brand
from django.contrib.auth import get_user_model


User = get_user_model()

class CartItemModelTestCase(TestCase):
    """Тесты для модели CartItem"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='cartitem@example.com',
            previously_existed=True
        )
        self.item = Item.objects.create(
            title='Товар в корзине',
            article='ART100',
            code='CODE100',
            price=99.9,
            volume_UOM='мл',
            volume_size=500.0,
            UOM='шт',
            weight_usage=False,
            country='Латвия',
            public=True
        )

    def test_create_cart_item(self):
        """Тест создания элемента корзины"""
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(
            item=self.item,
            cart=cart,
            amount=2
        )
        
        self.assertEqual(cart_item.item, self.item)
        self.assertEqual(cart_item.cart, cart)
        self.assertEqual(cart_item.amount, 2)

    def test_cart_item_amount_min_value(self):
        """Тест минимального значения количества"""
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(
            item=self.item,
            cart=cart,
            amount=0
        )
        self.assertEqual(cart_item.amount, 0)
