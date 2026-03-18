# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from django.contrib.postgres.search import SearchVector

# from .models import Item

# @receiver(post_save, sender=Item)
# def update_search_vector(sender, instance, **kwargs):
#     Item.objects.filter(id=instance.id).update(
#         search_vector=SearchVector('title', weight='A')
#     )