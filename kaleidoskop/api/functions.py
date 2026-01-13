from .models import Nomenclature

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