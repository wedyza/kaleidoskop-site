from .models import Nomenclature

def get_nomenclatures(level_of_nesting:int):
    nomenclatures = Nomenclature.objects.filter(parent=None).all()
    while level_of_nesting != 0:
        nomenclatures = Nomenclature.objects.filter(parent__in=nomenclatures).all()
        level_of_nesting -= 1
    return nomenclatures
