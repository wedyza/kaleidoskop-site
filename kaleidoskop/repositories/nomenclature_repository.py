from uuid import UUID
from api.models import Nomenclature
from django.db.models import QuerySet
from typing import Union

class NomenclatureRepository:
    def create_new_nomenclatures(self, data:list) -> bool:
        """
        Создает не существующие в бд номенклатуры
        """
        new_nomenclatures = [Nomenclature(**nomenclature) for nomenclature in data]
        created = Nomenclature.objects.bulk_create(new_nomenclatures, ignore_conflicts=True)
        return len(created) != 0
    
    
    def fillup_nomenclatures_with_parents(self):
        """
        Заполняет родительские номенклатуры
        """
        nomenclatures = Nomenclature.objects.exclude(parent_code=None).filter(parent=None).all()
        for nomenclature in nomenclatures:
            try:
                nomenclature.parent = Nomenclature.objects.get(code=nomenclature.parent_code)
            except:  # noqa: E722
                pass
        Nomenclature.objects.bulk_update(nomenclatures, fields=["parent"])
        
    def get_daughter_nomenclatures(self, nomenclatures: Union[QuerySet, list[Nomenclature]]) -> Union[QuerySet, list[Nomenclature]]:
        returning = nomenclatures
        while True:
            past = returning.count()
            returning |= Nomenclature.objects.filter(parent__in=returning).exclude(id__in=returning.values_list('id', flat=True)).all()
            now = returning.count() 
            if past - now == 0:
                return returning
            
    def get_nomenclatures(self, level_of_nesting: int) -> Union[QuerySet, list[Nomenclature]]:
        nomenclatures = Nomenclature.objects.filter(parent=None).all()
        while level_of_nesting != 0:
            nomenclatures = Nomenclature.objects.filter(parent__in=nomenclatures).all()
            level_of_nesting -= 1
        return nomenclatures
    
    def get_nomenclature_by_id(self, pk: UUID) -> Nomenclature:
        return Nomenclature.objects.get(id=pk)