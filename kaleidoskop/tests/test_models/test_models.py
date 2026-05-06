from django.test import TestCase
from api.models import Warehouse, Banner, Brand
from django.contrib.auth import get_user_model


User = get_user_model()

class WarehouseModelTestCase(TestCase):
    """Тесты для модели Warehouse (Склады)"""

    def test_create_warehouse(self):
        """Тест создания склада"""
        warehouse = Warehouse.objects.create(
            name='Основной склад',
            custom_name='Main Warehouse'
        )
        
        self.assertEqual(warehouse.name, 'Основной склад')
        self.assertEqual(str(warehouse), 'Main Warehouse')


class BannerModelTestCase(TestCase):
    """Тесты для модели Banner"""

    def test_create_banner(self):
        """Тест создания баннера"""
        banner = Banner.objects.create(
            source='test_banner.svg',
            group_type=Banner.BannerGroupType.FIRST,
            queue=1
        )
        
        self.assertTrue(banner.active)


class BrandModelTestCase(TestCase):
    """Тесты для модели Brand (Бренды)"""

    def test_create_brand(self):
        """Тест создания бренда"""
        brand = Brand.objects.create(title='BrandOne')
        
        self.assertEqual(brand.title, 'BrandOne')
