from django.test import TestCase
from services.item_service import ItemService
from api.models import CartItem, Item
from django.contrib.auth import get_user_model
from exceptions.exceptions import NotFoundException
from api.utils import slugify

User = get_user_model()

class TestCartService(TestCase):
    def setUp(self):
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
        self.recommended_item = Item.objects.create(
            title='Пробаа',
            article='ART003',
            code='CODE003',
            price=50.0,
            volume_UOM='мл',
            volume_size=1000.0,
            UOM='шт',
            weight_usage=False,
            country='Китай',
            barcode='Something123',
            public=True
        )
        self.item_service = ItemService()
        self.item.slug = slugify(self.item.title)
        self.item.save()
        
    def test_get_item_by_id(self):
        """Нахождение по id"""
        
        self.assertEqual(self.item.id, self.item_service.get_item_by_id(self.item.id).id)
        
        try:
            self.item_service.get_item_by_id('КАКАЯ НИБУДЬ ХТОООНЬ')
        except NotFoundException:
            pass
        except Exception as e:
            raise e

    def test_find_item_by_slug(self):
        """Нахождение по слагу"""
    
        self.assertEqual(self.item.id, self.item_service.find_by_slug(self.item.slug).id)
        
        try:
            self.item_service.find_by_slug('КАКАЯ НИБУДЬ ХТОООНЬ')
        except NotFoundException:
            pass
        except Exception as e:
            raise e

    def test_find_by_query(self):
        """Поиск по запросу"""

        query = 'Проба'
        
        items = self.item_service.find_by_query(query)
        
        self.assertEqual(items.count(), 2)
        self.assertEqual(items.first().id, self.another_item.id)
        
    def test_get_recommended(self):
        """Рекомендация по названию товара"""
        
        item = self.item_service.get_recommended_items_queryset(self.another_item.id)
        
        self.assertEqual(item.count(), 1)
        self.assertEqual(item.first().id, self.recommended_item.id)
    
    