from django.core.management.base import BaseCommand
from django.contrib.postgres.search import SearchVector, TrigramSimilarity
from api.models import Item, Nomenclature
from django.db.models import Value
from django.db.models.functions import Lower
from search.functions import Unaccent
from django.db.models.functions import Lower
from django.db import transaction

class Command(BaseCommand):
    help = "Находит \"близкие\" товары (товары, которые по факту являются одним товаром, но с разными хар-ками)"
    SIMILARITY_SCORE = 0.75

    @transaction.atomic
    def handle(self, *args, **options):
        items = Item.objects.exclude(nomenclature__associative=True).all()
        print(items)
        associated = []
        groups = 0
        for item in items:
            if item in associated: # Надо будет ещще 
                continue

            simillar = Item.objects.annotate(
                similarity_score=TrigramSimilarity(Lower(Value(item.title)), Lower('title'))
            ).filter(similarity_score__gte=self.SIMILARITY_SCORE).exclude(id=item.id).filter(nomenclature=item.nomenclature).all()
            if simillar.count() > 0: # Хэндлить товары не из одной номенклатуры наверное не буду
                planning_associated = item.nomenclature
                # same_nomenclature = sum([0 if i.nomenclature == planning_associated else 1 for i in simillar])
                self.stdout.write(self.style.WARNING(f'Найдено совпадение, группа: {planning_associated}, предмет: {item}, его братья: {simillar}'))
                # if same_nomenclature == 0: # ни у кого нет другого
                items_count = Item.objects.filter(nomenclature=planning_associated).count()
                self.stdout.write(self.style.ERROR(f'Кол-во предметов с этой номенклатурой: {items_count}, сколько похожих мы нашли + наш: {simillar.count() + 1}'))
                if items_count == simillar.count() + 1:
                    planning_associated.associative = True
                    planning_associated.save()
                    self.stdout.write(self.style.SUCCESS('Группа и так ассоциативная'))
                else:
                    self.stdout.write(self.style.SUCCESS('Строим свою'))
                    new_nomenclature = Nomenclature(
                        title=item.title + "associative group",
                        parent=planning_associated,
                        imported=False,
                        code=None,
                        parent_code=None,
                        associative=True
                    )
                    new_nomenclature.save()
                    simillar.update(nomenclature=new_nomenclature)

                associated.append(item)
                associated.extend(simillar)
                groups += 1

        self.stdout.write(self.style.SUCCESS(f'Завершено построение ассоциативных групп, предметов {len(associated)}. Групп: {groups}'))
        # raise BaseException