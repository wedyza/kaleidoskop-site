from django.test import TestCase
from admin_panel.models import SiteSettings, Compilation
from api.models import Nomenclature, Category, NomenclatureCategory
from django.utils import timezone

from uuid import UUID


class AdminPanelTests(TestCase):
    """Тесты для приложения admin_panel"""
    def test_compilation_creation(self):
        """Тест создания подборки"""
        compilation = Compilation.objects.create(
            title='Тестовая подборка',
            start_time=timezone.now(),
            active=False,
            queue=1
        )
        
        self.assertEqual(compilation.title, 'Тестовая подборка')
        self.assertFalse(compilation.active)
        self.assertEqual(compilation.queue, 1)

    def test_category_with_nomenclature(self):
        """Тест категории с номенклатурой"""
        category = Category.objects.create(
            title='Категория Тест',
            slug='test-category'
        )

        nomenclature = Nomenclature.objects.create(
            title='Продукт теста',
            code='PROD001'
        )
        
        link = NomenclatureCategory.objects.create(category=category, nomenclature=nomenclature)
        
        self.assertEqual(link.category, category)
        self.assertEqual(link.nomenclature, nomenclature)
        
        


class AdminUserTests(TestCase):
    """Тесты админ-пользователей"""

    def test_admin_user_creation(self):
        """Тест создания админа"""
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        admin = User.objects.create_superuser(
            email='admin@kaleidoskop.com',
            first_name='Александр',
            last_name='Админ',
            phone_number='+79001112233'
        )
        
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
