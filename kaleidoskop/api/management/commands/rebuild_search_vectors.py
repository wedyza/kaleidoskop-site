from django.core.management.base import BaseCommand
from django.contrib.postgres.search import SearchVector
from api.models import Item
from search.functions import Unaccent
from django.db.models.functions import Lower

class Command(BaseCommand):
    help = "Пересчитывает index search_vector для модели Item"

    def handle(self, *args, **options):
        updated = Item.objects.update(
            search_vector=SearchVector(Lower(Unaccent("title")), weight="A")
        )

        self.stdout.write(self.style.SUCCESS(f"Обновлено товаров: {updated}"))