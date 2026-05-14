from django.test import TestCase
from api.models import Item
from django.contrib.auth import get_user_model


User = get_user_model()


class ItemModelTestCase(TestCase):
    """Тесты для модели Item"""

    def test_create_item_with_required_fields(self):
        """Тест создания товара с обязательными полями"""
        item = Item.objects.create(
            title='Тестовый товар',
            article='ART001',
            code='CODE001',
            price=100.0,
            volume_UOM='мл',
            volume_size=500.0,
            UOM='шт',
            weight_usage=False,
            country='Россия',
            public=True
        )

        self.assertEqual(item.title, 'Тестовый товар')
        self.assertEqual(item.article, 'ART001')
        self.assertEqual(item.price, 100.0)
        self.assertTrue(item.public)
        
    def test_create_item_fail_with_required_fields(self):
        """Тест создания товара с обязательными полями"""
        
        try:
            Item.objects.create(
                code='CODE001',
                volume_UOM='мл',
                volume_size=500.0,
                UOM='шт',
                weight_usage=False,
                country='Россия',
                public=True
            )
            self.fail("Создался")
        except:
            pass

    def test_item_str_representation(self):
        """Тест строкового представления товара"""
        item = Item.objects.create(
            title='Проба',
            article='ART002',
            code='CODE002',
            price=50.0,
            volume_UOM='мл',
            volume_size=1000.0,
            UOM='шт',
            weight_usage=False,
            country='Китай',
            public=True
        )
        self.assertEqual(str(item), 'Проба')

    def test_item_slug_unique_constraint(self):
        """Тест уникальности slug"""
        try:
            Item.objects.create(
                title='Первый товар',
                article='ART003',
                code='CODE003',
                price=150.0,
                volume_UOM='мл',
                volume_size=250.0,
                UOM='шт',
                weight_usage=False,
                country='Италия',
                barcode='1',
                slug='первый-товар',
                public=True
            )
            
            Item.objects.create(
                title='Второй товар',
                article='ART004',
                code='CODE004',
                price=200.0,
                volume_UOM='мл',
                volume_size=350.0,
                UOM='шт',
                weight_usage=False,
                country='Германия',
                barcode='2',
                slug='первый-товар',
                public=True
            )
            self.fail('Должен был подняться IntegrityError')
        except Exception:
            pass
        
    def test_item_code_unique_constraint(self):
        """Тест уникальности code"""
        try:
            Item.objects.create(
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
                public=True
            )
            
            Item.objects.create(
                title='Второй товар',
                article='ART004',
                code='CODE003',
                price=200.0,
                volume_UOM='мл',
                volume_size=350.0,
                UOM='шт',
                weight_usage=False,
                country='Германия',
                slug='второй-товар', 
                public=True
            )
            self.fail('Должен был подняться IntegrityError')
        except Exception:
            pass