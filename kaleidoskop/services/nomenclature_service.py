from uuid import UUID
from repositories.nomenclature_repository import NomenclatureRepository
from typing import Iterable
from api.models import Nomenclature, Category

class NomenclatureService:
    __nomenclature_repository = NomenclatureRepository()
    
    def fill_nomenclatures_from_1C(self, data: dict[str, str|int]):
        created = self.__nomenclature_repository.create_new_nomenclatures(data)
        if created:
            self.__nomenclature_repository.fillup_nomenclatures_with_parents()

    def get_daughter_nomenclatures(self, nomenclatures: Iterable[Nomenclature]) -> Iterable[Nomenclature]:
        return self.__nomenclature_repository.get_daughter_nomenclatures(nomenclatures)
        
    def get_nomenclatures(self, level_of_nesting:int) -> Iterable[Nomenclature]:
        return self.__nomenclature_repository.get_nomenclatures(level_of_nesting)
    
    def remove_nomenclature_from_category(self, category_pk: UUID, nomenclature_pk: UUID):
        category = Category.objects.get(id=category_pk)
        nomenclature = self.__nomenclature_repository.get_nomenclature_by_id(nomenclature_pk)
        category.nomenclatures.remove(nomenclature)