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
    class Meta:
        verbose_name = 'Номенклатура'
        verbose_name_plural = "Номенклатуры"

    def __str__(self):
        return self.title
    



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

    
    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = "Категории"

    @property
    def slug(self):
        return f'{slugify(self.title)}--{self.id}'
    

    def __str__(self):
        return self.title


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

    
    class Meta:
        verbose_name = 'Номенклатура<->Категория'
        verbose_name_plural = "Номенклатуры<->Категории"


class Item(UUIDModel):
    class PriceGroup(models.TextChoices):
        NOTHING = 'Без скидки'
        FIRST = 'Ценовая группа 1%'
        SECOND = 'Ценовая группа 2%'
        THIRD = 'Ценовая группа 3%'
        FOURTH = 'Ценовая группа 4%'
        FIFTH = 'Ценовая группа 5%'


    title = models.CharField("Название", max_length=100)
    nomenclature = models.ForeignKey(
        Nomenclature,
        null=True,
        verbose_name="Номенклатура",
        related_name="items",
        on_delete=models.DO_NOTHING,
    )
    description = models.TextField("Описание", max_length=500, null=True)
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
    okdp = models.CharField('ОКДП', max_length=50, null=True, blank=True)
    price_group = models.CharField('Ценновая группа', max_length=100, default=PriceGroup.NOTHING, choices=PriceGroup.choices)
    barcode = models.CharField('Штрихкод', max_length=100, unique=True, null=False, blank=False)

    brand = models.ForeignKey(
        'Brand',
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Брэнд',
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = "Товары"

        
    @property
    def slug(self):
        return f"{slugify(self.title)}--{self.id}"
    
    
    def __str__(self):
        return self.title


class Cart(UUIDModel):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=False, verbose_name="Пользователь"
    )
    # bought = models.BooleanField("Оплаченная корзина", default=False)
    current_cart = models.BooleanField("Текущая корзина", default=True)
    order = models.OneToOneField(
        'Order',
        on_delete=models.CASCADE,
        verbose_name="Заказ",
        related_name="cart",
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = 'Корзина'
        verbose_name_plural = "Корзины"


class PaymentStatusChoices(Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    ERROR = "ERROR"


class Order(UUIDModel):
    class OrderStatus(models.TextChoices):
        SENDED = 'Отправлен'
        ON_APPROVE = "На согласовании"
        APPROVED = 'Согласован'
        ON_REALISATION = 'На реализации'
        REALISED = 'Реализован'
        CANCELED = 'Отменен'

    class DeliveryMethods(models.TextChoices):
        SELF_PICKUP = 'Самовывоз'
        DELIVERY = 'Доставка'

    class PaymentMethods(models.TextChoices):
        CASH = 'Наличными'
        CREDIT_CARD = 'Картой'
        ONLINE = 'Онлайн' # СБП / Онлайн банкинг

    # address = models.CharField("Адрес", null=True, max_length=200) # Если будет возможно, то сделать дробление (Зависит от Яндекс карт) и мб вернуть длину и ширину тогда
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=False, verbose_name="Пользователь"
    )
    total_price = models.IntegerField("Цена", null=False)
    # cart = models.OneToOneField(
    #     Cart, null=False, on_delete=models.DO_NOTHING, verbose_name="Корзина", 
    # )
    status = models.TextField(
        "Статус",
        choices=OrderStatus.choices,
        default=OrderStatus.SENDED,
    )
    delivery_method = models.TextField(
        'Способ доставки',
        choices=DeliveryMethods.choices,
        default=DeliveryMethods.SELF_PICKUP,
        null=False
    )
    payment_method = models.TextField(
        'Способ оплаты',
        choices=PaymentMethods.choices,
        default=PaymentMethods.ONLINE,
        null=False
    )
    code = models.CharField('Код', null=True, unique=True, max_length=20) # Для 1С
    created_at = models.DateTimeField("Дата создания", auto_now_add=True)

    
    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = "Заказы"


class Like(UUIDModel):
    item = models.ForeignKey(
        Item, null=False, on_delete=models.CASCADE, verbose_name="Товар"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=False, verbose_name="Пользователь"
    )
    created_at = models.DateTimeField("Дата создания", auto_now_add=True)

    
    class Meta:
        verbose_name = 'Избранное'
        verbose_name_plural = "Избранное"


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
    amount = models.IntegerField("Количество", validators=[
        MinValueValidator(0), MaxValueValidator(1000)
    ])
    marked_for_order = models.BooleanField("Помечено для заказа", default=False)

    
    class Meta:
        verbose_name = 'Товар в корзине'
        verbose_name_plural = "Товары в корзинах"


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

    
    class Meta:
        verbose_name = 'Отзыв'
        verbose_name_plural = "Отзывы"


class Warehouse(UUIDModel):
    name = models.CharField("Название", max_length=50)
    custom_name = models.CharField("Пользовательское название", max_length=50)

    class Meta:
        verbose_name = 'Склад'
        verbose_name_plural = "Склады"


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

    
    class Meta:
        verbose_name = 'Остаток'
        verbose_name_plural = "Остатки"

    
    def __str__(self):
        return f"{self.item.title} - {self.warehouse.name}"

class ItemImage(UUIDModel):
    source = models.ImageField(upload_to="media", null=False, max_length=300)
    item = models.ForeignKey(
        Item,
        verbose_name="Товар",
        related_name="images",
        on_delete=models.CASCADE
    )

    def delete(self, *args, **kwargs):
        self.source.delete()
        super(ItemImage, self).delete(*args, **kwargs)


class ParameterItem(UUIDModel):
    value = models.TextField("Значение", max_length=200, null=False, blank=False)
    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        verbose_name='Предмет',
        related_name='parameters'
    )
    parameter = models.ForeignKey(
        'Parameter',
        on_delete=models.CASCADE,
        verbose_name='Параметр',
        related_name='values'
    )


class Parameter(UUIDModel):
    title = models.CharField("Название", max_length=100, null=False, blank=False)
    unit = models.CharField("Единица измерения", max_length=25, blank=True, null=True)
    # value = models.TextField("Значение", max_length=200, null=False, blank=False)


class Brand(UUIDModel):
    title = models.CharField("Название", max_length=100, null=False)

class Shop(UUIDModel):
    title = models.CharField("Название магазина", max_length=100, null=False)
    longtitude = models.DecimalField(
        'Долгота',
        max_digits=9,
        decimal_places=6,
        null=False
    )
    latitude = models.DecimalField(
        'Широта',
        max_digits=9,
        decimal_places=6,
        null=False
    )
    city = models.CharField("Город", max_length=20, null=False)
    street = models.CharField("Улица", max_length=50, null=False)
    house = models.IntegerField("Дом", validators=[MinValueValidator(0)])

# class Banner(UUIDModel):
#     source = models.ImageField(upload_to='banners', max_length=255)
#     title = ?