from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from api.functions import compress_image
from .models import Item, Category, Banner
from api.utils import slugify

@receiver(post_save, sender=Category)
def update_slug(sender, instance:Category, **kwargs):
    Category.objects.filter(id=instance.id).update(
        slug=slugify(instance.title)
    )

@receiver(pre_save, sender=Category)
def compress_category_image(sender, instance: Category, **kwargs):
    if instance.image:
        if hasattr(instance.source, 'file'):
            instance.source = compress_image(instance.source)
            
@receiver(pre_save, sender=Banner)
def compress_banner_image(sender, instance: Banner, **kwargs):
    if instance.image:
        if hasattr(instance.source, 'file') and not instance.pk:
            instance.source = compress_image(instance.source)
