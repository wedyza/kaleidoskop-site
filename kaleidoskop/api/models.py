from django.db import models
from django.contrib.auth import get_user_model
from enum import Enum
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
from .utils import slugify
User = get_user_model()


class UUIDModel(models.Model):
    id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True)

    class Meta:
        abstract = True


# Create your models here.
class Category(UUIDModel):
    title = models.CharField("Название", max_length=100)
    parent = models.ForeignKey(
        "self",
        null=True,
        default=None,
        verbose_name="Родительская категория",
        on_delete=models.SET_NULL,
        related_name="daughter",
    )
    code = models.CharField("Код", max_length=20, unique=True, null=False)
    parent_code = models.CharField("Код родителя", max_length=20, null=True)
    # img = imagefield

    @property
    def slug(self):
        return slugify(self.title) + '-' + slugify(self.code)


class Item(UUIDModel):
    title = models.CharField("Название", max_length=100)
    category = models.ForeignKey(
        Category,
        null=True,
        verbose_name="Категория",
        related_name="items",
        on_delete=models.DO_NOTHING,
    )
    description = models.TextField("Описание", max_length=500)
    price = models.FloatField("Цена", null=False)
    article = models.CharField(
        "Артикул", max_length=40, unique=True, null=False
    )  # MUST BE UNIQUE (produmat)
    code = models.CharField(
        "Код", max_length=20, unique=True, null=False
    )  # MUST BE UNIQUE (produmat)
    volume_UOM = models.CharField("Объем Единицы Измерения", max_length=5, null=True)
    volume_size = models.FloatField("Объем", null=True)
    UOM = models.CharField("Единица измерения", max_length=15, null=True)
    weight_usage = models.BooleanField("Использование Веса", null=False)
    weight_UOM = models.CharField("Вес единица измерения", max_length=5, null=True)
    weight_size = models.FloatField("Вес", null=True)
    parent_code = models.CharField("Код родителя", max_length=20, null=True)
    country = models.CharField("Страна-производитель", max_length=25, null=True)
    public = models.BooleanField("Доступен публично", default=False, null=False)

    @property
    def slug(self):
        return slugify(self.title) + '-' + slugify(self.article)

class Cart(UUIDModel):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=False, verbose_name="Пользователь"
    )
    bought = models.BooleanField("Оплаченная корзина", default=False)
    current_cart = models.BooleanField("Текущая корзина", default=True)

class PaymentStatusChoices(Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    ERROR = "ERROR"

class Order(UUIDModel):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=False, verbose_name="Пользователь"
    )
    total_price = models.IntegerField("Цена", null=False)
    cart = models.ForeignKey(
        Cart, null=False, on_delete=models.DO_NOTHING, verbose_name="Корзина"
    )
    status = models.TextField(
        "Статус",
        choices=[(status.name, status.value) for status in PaymentStatusChoices],
        default=PaymentStatusChoices.PENDING,
    )

class Like(UUIDModel):
    item = models.ForeignKey(
        Item, null=False, on_delete=models.CASCADE, verbose_name="Товар"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=False, verbose_name="Пользователь"
    )
    created_at = models.DateTimeField("Дата создания", auto_now_add=True)

class CartItem(UUIDModel):
    item = models.ForeignKey(
        Item, null=False, on_delete=models.CASCADE, verbose_name="Товар"
    )
    cart = models.ForeignKey(
        Cart,
        null=False,
        on_delete=models.CASCADE,
        verbose_name="Корзина",
        related_name="items",
    )
    amount = models.IntegerField("Количество")


# class Banner(models.Model):
#     pass


class Comment(UUIDModel):
    item = models.ForeignKey(
        Item,
        null=False,
        on_delete=models.CASCADE,
        verbose_name="Товар",
        related_name="comments",
    )
    rate = models.IntegerField(
        "Рейтинг", default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    body = models.TextField("Тело отзыва", max_length=400)
    created_at = models.DateTimeField("Дата создания", auto_now_add=True)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=False, verbose_name="Пользователь"
    )


class Warehouse(UUIDModel):
    name = models.CharField("Название", max_length=50)
    custom_name = models.CharField("Пользовательское название", max_length=50)

    def __str__(self):
        return self.custom_name


class Remains(UUIDModel):
    item = models.ForeignKey(
        Item,
        null=False,
        on_delete=models.CASCADE,
        verbose_name="Товар",
        related_name="remains",
    )
    count = models.FloatField("Количество")
    warehouse = models.ForeignKey(
        Warehouse,
        null=False,
        on_delete=models.CASCADE,
        verbose_name="Склад",
        related_name="remains",
    )


# class SiteSettings(models.Model):
#     pass


# class CommentReply(models.Model):
#     pass


# class Document(models.Model):
#     pass


# class ItemMedia(models.Model):
#     pass


# class Media(models.Model):
    # pass
