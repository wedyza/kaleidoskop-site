from django.db import models
from django.contrib.auth import get_user_model
from enum import Enum
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

# Create your models here.
class Category(models.Model):
    title = models.CharField("Название", max_length=50)
    parent = models.ForeignKey("self", null=True, default=None, verbose_name="Родительская категория", on_delete=models.SET_NULL, related_name="daughter")
    #img = imagefield


class Item(models.Model):
    title = models.CharField("Название", max_length=50)
    category = models.ForeignKey(
        Category,
        null=False,
        verbose_name='Категория',
        related_name='items',
        on_delete=models.DO_NOTHING
    )
    description = models.TextField('Описание', max_length=500)
    price = models.IntegerField("Цена", null=False)
    article = models.CharField("Артикул", max_length=10)

    #img = imagefield


class Cart(models.Model):
    #user = models.Foreignkey()
    bought = models.BooleanField("Оплаченная корзина", default=False)
    current_cart = models.BooleanField("Текущая корзина", default=True)



class PaymentStatusChoices(Enum):
    PENDING = 'PENDING'
    SUCCESS = 'SUCCESS'
    ERROR = 'ERROR'


class Order(models.Model):
    #user = models.Foreignkey()
    total_price = models.IntegerField("Цена", null=False)
    cart = models.ForeignKey(
        Cart,
        null=False,
        on_delete=models.DO_NOTHING,
        verbose_name='Корзина'
    )
    status = models.TextField(
        "Статус",
        choices=[(status.name, status.value) for status in PaymentStatusChoices],
        default=PaymentStatusChoices.PENDING,
    )


class Like(models.Model):
    item = models.ForeignKey(
        Item,
        null=False,
        on_delete=models.CASCADE,
        verbose_name='Товар'
    )
    #user = models.ForeignKey()
    created_at = models.DateTimeField("Дата создания", auto_now_add=True)


class CartItem(models.Model):
    item = models.ForeignKey(
        Item,
        null=False,
        on_delete=models.CASCADE,
        verbose_name='Товар'
    )
    cart = models.ForeignKey(
        Cart,
        null=False,
        on_delete=models.CASCADE,
        verbose_name='Корзина'
    )
    amount = models.IntegerField("Количество")


# class Banner(models.Model):
#     pass


class Comment(models.Model):
    item = models.ForeignKey(
        Item,
        null=False,
        on_delete=models.CASCADE,
        verbose_name='Товар',
        related_name='comments'
    )
    rate = models.IntegerField(
        "Рейтинг", default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    body = models.TextField("Тело отзыва", max_length=400)
    created_at = models.DateTimeField("Дата создания", auto_now_add=True)
    #user = models.ForeignKey()


# class CommentReply(models.Model):
#     pass
 

# class Document(models.Model):
#     pass


# class ItemMedia(models.Model):
#     pass


# class Media(models.Model):
    # pass

