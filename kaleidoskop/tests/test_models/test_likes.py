from django.test import TestCase
from api.models import Item, Like
from django.contrib.auth import get_user_model

User = get_user_model()

class LikeModelTestCase(TestCase):
    """Тесты для модели Like (Избранное)"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='like@example.com',
            previously_existed=True
        )
        self.item = Item.objects.create(
            title='Избранный товар',
            article='ART500',
            code='CODE500',
            price=199.9,
            volume_UOM='мл',
            volume_size=250.0,
            UOM='шт',
            weight_usage=False,
            country='Франция',
            public=True
        )
        

    def test_create_like(self):
        """Тест создания лайка"""
        
        like = Like.objects.create(item=self.item, user=self.user)
        
        self.assertEqual(like.item, self.item)
        self.assertEqual(like.user, self.user)
        self.assertTrue(Like.objects.filter(user=self.user).filter(item=self.item).exists())

    def test_user_cannot_like_same_item_twice(self):
        """Тест что нельзя лайкать один товар дважды"""
        like = Like.objects.create(item=self.item, user=self.user)
        
        flag = True
        try:
            like = Like.objects.create(item=self.item, user=self.user)
            flag = False
        except:
            pass        
        
        self.assertTrue(flag)    