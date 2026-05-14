from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import RegexValidator, MaxValueValidator, MinValueValidator
from django.utils import timezone
from enum import Enum


class UserManager(BaseUserManager):  # pragma: no cover
    """Define a model manager for User model with no username field."""

    use_in_migrations = True

    def _create_user(self, email, admin=False, **extra_fields):
        if not email:
            raise ValueError("Должна быть почта")

        self.email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.is_active = False
        if admin:
            user.user_type = "Администратор"
            user.is_active = True
            user.is_staff = True
            user.is_superuser = True
            user.set_password("admin")
        else:
            user.set_unusable_password()
        user.save()
        return user

    def create_user(self, email, **extra_fields):
        return self._create_user(email, **extra_fields)

    def create_superuser(self, email, **extra_fields):
        return self._create_user(email, True, **extra_fields)


class CustomAbstractUser(AbstractUser):
    class SexType(Enum):
        MALE = "Мужчина"
        FEMALE = "Женщина"

    username = None
    USERNAME_FIELD = "email"
    objects = UserManager()
    email = models.EmailField(unique=True)
    last_login = None
    otp = models.CharField(max_length=6, null=True, blank=True)
    sex = models.TextField(
        "Пол пользователя",
        choices=[(sex.name, sex.value) for sex in SexType],
        null=True,
    )
    phone_regex = RegexValidator(
        regex=r'^\+7\d{10}$',
        message='Номер телефона должен быть введен в формате +7XXXXXXXXXX.'
    )
    phone_number = models.CharField(
        'Номер телефона',
        validators=[phone_regex],
        null=True,
        max_length=12,
        unique=True
    )
    avatar = models.ImageField("Аватар", upload_to="avatars", null=True)
    REQUIRED_FIELDS = []
    otp_expires = models.DateTimeField("Время жизни otp", null=True, blank=True)
    date_joined = None
    first_name = models.CharField("Имя", max_length=30, null=True)
    last_name = models.CharField("Фамилия", max_length=30, null=True)
    middle_name = models.CharField("Отчество", max_length=30, null=True)
    code = models.CharField("Код", max_length=15, null=True)
    okdp = models.CharField('ОКДП', max_length=40, null=True)
    email_to_change = models.EmailField(null=True, blank=True)
    otp_expires_change_email = models.DateTimeField("Время жизни otp", null=True, blank=True)
    otp_change_email = models.CharField(max_length=6, null=True, blank=True)
    previously_existed = models.BooleanField('Существовал ли пользователь ранее', default=False)

    def __str__(self):
        return self.email
