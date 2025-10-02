from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from enum import Enum
import uuid
from .utils import slugify

User = get_user_model()


class UUIDModel(models.Model):
    id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True)

    class Meta:
        abstract = True


class Nomenclature(UUIDModel):
    title = models.CharField("Название", max_length=100)
    parent = models.ForeignKey(
        "self",
        null=True,
        default=None,
        verbose_name="Родительская номенклатура",
        on_delete=models.SET_NULL,
        related_name="daughter",
    )
    code = models.CharField("Код", max_length=20, unique=True, null=False)
    parent_code = models.CharField("Код родителя", max_length=20, null=True)
    categories = models.ManyToManyField(
        'Category',
        through='NomenclatureCategory',
        related_name='categories'
    )



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
    nomenclatures = models.ManyToManyField(
        Nomenclature,
        through='NomenclatureCategory',
        related_name='nomenclatures'
    )
    # code = models.CharField("Код", max_length=20, unique=True, null=False)
    # parent_code = models.CharField("Код родителя", max_length=20, null=True)
    # img = imagefield

    @property
    def slug(self):
        return slugify(self.title) + "-" + slugify(self.code)


class NomenclatureCategory(UUIDModel):
    category = models.ForeignKey(
        Category,
        verbose_name='Категория',
        on_delete=models.CASCADE
    )
    nomenclature = models.ForeignKey(
        Nomenclature,
        verbose_name='Номенклатура',
        on_delete=models.CASCADE
    )


class Item(UUIDModel):
    title = models.CharField("Название", max_length=100)
    nomenclature = models.ForeignKey(
        Nomenclature,
        null=True,
        verbose_name="Номенклатура",
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
        return slugify(self.title) + "-" + slugify(self.article)


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
    class OrderStatus(models.TextChoices):
        ON_APPROVE = "На согласовании"
        APPROVED = 'Согласован'
        ON_REALISATION = 'На реализации'
        REALISED = 'Реализован'

    class DeliveryMethods(models.TextChoices):
        SELF_PICKUP = 'Самовывоз'
        DELIVERY = 'Доставка'

    class PaymentMethods(models.TextChoices):
        CASH = 'Наличными'
        CREDIT_CARD = 'Картой'
        ONLINE = 'Онлайн' # СБП / Онлайн банкинг

    address = models.CharField("Адрес", null=False, max_length=100)
    address_longtitude = models.DecimalField(
        "Долгота", max_digits=9, decimal_places=6, null=True
    )
    address_latitude = models.DecimalField("Широта", max_digits=9, decimal_places=6, null=True)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=False, verbose_name="Пользователь"
    )
    total_price = models.IntegerField("Цена", null=False)
    cart = models.OneToOneField(
        Cart, null=False, on_delete=models.DO_NOTHING, verbose_name="Корзина", 
    )
    status = models.TextField(
        "Статус",
        choices=OrderStatus.choices,
        default=OrderStatus.ON_APPROVE,
    )
    delivery_method = models.TextField(
        'Способ доставки',
        choices=DeliveryMethods.choices,
        default=DeliveryMethods.SELF_PICKUP
    )
    payment_method = models.TextField(
        'Способ оплаты',
        choices=PaymentMethods.choices,
        default=PaymentMethods.ONLINE
    )
    code = models.CharField('Код', null=True, unique=True, max_length=20) # Для 1С


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
    marked_for_order = models.BooleanField("Помечено для заказа", default=False)


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
