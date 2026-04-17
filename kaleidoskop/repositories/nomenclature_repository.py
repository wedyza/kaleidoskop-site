from uuid import UUID
from api.models import Item, Nomenclature
from django.db.models import QuerySet
from api.decorators import cache_queryset
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
        
    def get_daughter_nomenclatures(self, nomenclatures: list[Nomenclature]) -> Union[QuerySet, list[Nomenclature]]:
        root_ids = [str(n.id) for n in nomenclatures]
        
        with_recursive = """
        WITH RECURSIVE nomenclature_tree AS (
            SELECT id FROM api_nomenclature WHERE id = ANY(%s::uuid[])
            UNION ALL
            SELECT c.id
            FROM api_nomenclature c
            INNER JOIN nomenclature_tree ct ON c.parent_id = ct.id
        )
        SELECT DISTINCT id FROM nomenclature_tree
        """
        
        qs = Nomenclature.objects.raw(with_recursive, [root_ids])
        
        return list(qs)

    def get_nomenclatures(self, level_of_nesting: int) -> Union[QuerySet, list[Nomenclature]]:
        nomenclatures = Nomenclature.objects.filter(parent=None).filter(associative=False)
        while level_of_nesting != 0:
            nomenclatures = Nomenclature.objects.filter(parent__in=nomenclatures).filter(associative=False)
            level_of_nesting -= 1
        return nomenclatures
    
    def get_nomenclature_by_id(self, pk: UUID) -> Nomenclature:
        return Nomenclature.objects.get(id=pk)
    
    @cache_queryset('item_from_associative')
    def get_items_from_associative_nomenclature(self, pk: UUID) -> Union[QuerySet, list[Item]]:
        return Item.objects.filter(nomenclature_id=pk)
