from uuid import UUID
from repositories.nomenclature_repository import NomenclatureRepository
from typing import Iterable, Union
from django.db.models import QuerySet
from api.models import Nomenclature, Category

class NomenclatureService:
    _nomenclature_repository = NomenclatureRepository()
    
    def fill_nomenclatures_from_1C(self, data: list):
        created = self._nomenclature_repository.create_new_nomenclatures(data)
        if created:
            self._nomenclature_repository.fillup_nomenclatures_with_parents()

    def get_daughter_nomenclatures(self, nomenclatures: Union[QuerySet, list[Nomenclature]]) -> Union[QuerySet, list[Nomenclature]]:
        return self._nomenclature_repository.get_daughter_nomenclatures(nomenclatures)
        
    def get_nomenclatures(self, level_of_nesting:int) -> Union[QuerySet, list[Nomenclature]]:
        return self._nomenclature_repository.get_nomenclatures(level_of_nesting)
    
    def remove_nomenclature_from_category(self, category_pk: UUID, nomenclature_pk: UUID):
        category = Category.objects.get(id=category_pk)
        nomenclature = self._nomenclature_repository.get_nomenclature_by_id(nomenclature_pk)
        category.nomenclatures.remove(nomenclature)

    def get_items_from_associative_nomenclature(self, pk: UUID):
        return self._nomenclature_repository.get_items_from_associative_nomenclature(pk=pk)