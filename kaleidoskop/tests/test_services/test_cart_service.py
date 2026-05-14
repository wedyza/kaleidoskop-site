from django.test import TestCase
from unittest.mock import patch
from services.cart_service import CartService
from api.models import Cart
from django.contrib.auth import get_user_model
from exceptions.exceptions import EmailIsNotFree, OTPTimedOutException, WrongOTPPassedException
import unittest

User = get_user_model()

class TestCartService(TestCase):
    def setUp(self):
        self.user = User.objects.create(email="test@test.ru")
        self.cart_service = CartService()
        
    def cart_mega_test(self):
        """Супер тест, который проверяет все =)"""
        self.assertEqual(Cart.objects.all().count(), 0)

        cart = self.cart_service.get_cart_by_user(self.user.pk)
        self.assertEqual(Cart.objects.all().count(), 1)
        self.assertEqual(list(cart.items), []) # Пустая корзина создалась
        
        new_cart = self.cart_service.get_cart_by_user(self.user.pk)
        self.assertEqual(Cart.objects.all().count(), 1)
        self.assertEqual(list(cart.items), [])
        self.assertEqual(cart.pk, new_cart.pk) # Это та же корзина
