from django.core.management.base import BaseCommand
from django.contrib.postgres.search import TrigramSimilarity
from api.models import Item, Nomenclature
from django.db.models import Value
from django.db.models.functions import Lower
from django.db import transaction

class Command(BaseCommand):
    help = "Находит \"близкие\" товары (товары, которые по факту являются одним товаром, но с разными хар-ками)"
    SIMILARITY_SCORE = 0.8

    @transaction.atomic
    def handle(self, *args, **options):
        items = Item.objects.exclude(nomenclature__associative=True).all()
        print(items)
        associated = []
        groups = 0
        for item in items:
            if item.id in associated: 
                continue

            simillar = Item.objects.annotate(
                similarity_score=TrigramSimilarity(Lower(Value(item.title)), Lower('title'))
            ).filter(similarity_score__gte=self.SIMILARITY_SCORE).exclude(id=item.id).filter(nomenclature=item.nomenclature).all()
            if simillar.count() > 0:
                planning_associated = item.nomenclature
                self.stdout.write(self.style.WARNING(f'Найдено совпадение, группа: {planning_associated}, предмет: {item}, его братья: {simillar}'))
                items_count = Item.objects.filter(nomenclature=planning_associated).count()
                self.stdout.write(self.style.ERROR(f'Кол-во предметов с этой номенклатурой: {items_count}, сколько похожих мы нашли + наш: {simillar.count() + 1}'))
                if items_count == simillar.count() + 1:
                    planning_associated.associative = True
                    planning_associated.save()
                    self.stdout.write(self.style.SUCCESS('Группа и так ассоциативная'))
                else:
                    self.stdout.write(self.style.SUCCESS('Строим свою'))
                    new_nomenclature = Nomenclature(
                        title=item.title + " associative group",
                        parent=planning_associated,
                        imported=False,
                        code=None,
                        parent_code=None,
                        associative=True
                    )
                    new_nomenclature.save()
                    simillar.update(nomenclature=new_nomenclature)

                associated.append(item.id)
                associated.extend(list(simillar.values_list('id', flat=True)))
                
                groups += 1

        self.stdout.write(self.style.SUCCESS(f'Завершено построение ассоциативных групп, предметов {len(associated)}. Групп: {groups}'))
