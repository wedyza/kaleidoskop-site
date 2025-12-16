from django.db import models
from django.core.validators import MinValueValidator
from api.models import UUIDModel, Item, Nomenclature
from django.conf import settings
from django.utils import timezone

# Create your models here.
class SiteSettings(models.Model):
    data = models.JSONField("Настройки Сайта")
    edited_at = models.DateTimeField("Последнее изменение", auto_now_add=True)


class Compilation(UUIDModel):
    created_at = models.DateTimeField('Создано', auto_now_add=True)
    nomenclatures = models.ManyToManyField(Nomenclature, related_name='compilations')
    title = models.CharField('Название подборки',max_length=120 , null=False, blank=False)
    start_time = models.DateTimeField('Старт активности', default=timezone.now, null=False, blank=False)
    end_time = models.DateTimeField('Конец активности', null=True, blank=True)
    active = models.BooleanField('Активно', default=False, null=False, blank=False)
    queue = models.IntegerField('Очередь', null=False, blank=False, validators=[MinValueValidator(1)])

    # @property
    # def active_usage(self):
    #     return self.start_time != None or self.end_time != None
    
    # @property
    # def public_active(self):


"""
    {
        "settings": {
            "banners_1": [
                uuid1,
                uuid2,
                uuid3
            ],
            "special_category": category_id,
            "banners_2": [
                uuid4,
                uuid5,
                uuid6
            ]
        }
    }
"""