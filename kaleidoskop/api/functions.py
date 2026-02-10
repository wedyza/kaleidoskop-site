from typing import List
from .models import Nomenclature, Category, Item

def get_nomenclatures(level_of_nesting:int):
    nomenclatures = Nomenclature.objects.filter(parent=None).all()
    while level_of_nesting != 0:
        nomenclatures = Nomenclature.objects.filter(parent__in=nomenclatures).all()
        level_of_nesting -= 1
    return nomenclatures

def get_daughter_nomenclatures(nomenclatures):
    returning = nomenclatures
    while True:
        past = returning.count()
        returning |= Nomenclature.objects.filter(parent__in=returning).exclude(id__in=returning.values_list('id', flat=True)).all()
        now = returning.count() 
        if past - now == 0:
            return returning
        
def get_items_queryset_of_category(category):
    daughter_categories = category.daughter.all()
    base_nomenclatures = category.nomenclatures.all()
    for daughter in daughter_categories:
        base_nomenclatures |= daughter.nomenclatures.all()
    nomenclatures = get_daughter_nomenclatures(base_nomenclatures)
    return Item.objects.filter(nomenclature__in=nomenclatures)