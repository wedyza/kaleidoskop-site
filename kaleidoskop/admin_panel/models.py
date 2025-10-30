from django.db import models

# Create your models here.
class TelegramUser(models.Model):
    username = models.CharField("Имя пользователя", max_length=25)
    chat_id = models.CharField("ID чата", max_length=60)
    created_at = models.DateTimeField("Время созднания", auto_now_add=True)