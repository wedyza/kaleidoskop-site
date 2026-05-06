from django.test import TestCase
from api.models import Item, Cart, Order, Like, CartItem, Warehouse, Banner, Brand
from django.contrib.auth import get_user_model


User = get_user_model()

class CartModelTestCase(TestCase):
    """Тесты для модели Cart"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='cart@example.com',
            previously_existed=True
        )

    def test_create_user_cart(self):
        """Тест создания корзины пользователя"""
        cart = Cart.objects.create(user=self.user)
        
        self.assertEqual(cart.user, self.user)
        self.assertTrue(cart.current_cart)

    def test_cart_with_order(self):
        """Тест корзины с связанным заказом"""
        order = Order.objects.create(
            user=self.user,
            total_price=1500,
            status='ON_APPROVE'
        )
        cart = Cart.objects.create(user=self.user, order=order)
        self.assertTrue(order.cart == cart)

    def test_user_has_only_one_current_cart(self):
        """Тест что у пользователя одна текущая корзина"""
        cart1 = Cart.objects.create(user=self.user, current_cart=True)
        cart2 = Cart.objects.create(user=self.user, current_cart=False)
        order = Order.objects.create(
            user=self.user,
            total_price=500,
            cart=cart2
        )
        self.assertEqual(Cart.objects.filter(current_cart=True).filter(user=self.user).count(), 1)

    def test_create_order_from_cart(self):
        """Тест создания заказа из корзины"""
        cart = Cart.objects.create(user=self.user)
        item = Item.objects.create(
            title='Товар',
            article='ART099',
            code='CODE099',
            price=100.0,
            volume_UOM='мл',
            volume_size=500.0,
            UOM='шт',
            weight_usage=False,
            country='Россия',
            public=True
        )
        CartItem.objects.create(item=item, cart=cart, amount=1)
        order = Order.objects.create(
            user=self.user,
            total_price=500,
            cart=cart
        )
        self.assertEqual(order.cart.items.count(), 1)