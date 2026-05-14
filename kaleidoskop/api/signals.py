from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Item, Category
from api.utils import slugify

@receiver(post_save, sender=Category)
def update_slug(sender, instance, **kwargs):
    Category.objects.filter(id=instance.id).update(
        slug=slugify(instance.title)
    )