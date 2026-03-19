from typing import Union

from admin_panel.models import Compilation, Nomenclature
from admin_panel.serializers import CompilationCreateSerializer, NomenclatureRelatedSerializer
from exceptions.exceptions import NotFoundException
from repositories.compilation_repository import CompilationRepository
from uuid import UUID
from django.db.models import Exists, OuterRef, QuerySet

class CompilationService:
    _compilation_repository = CompilationRepository()

    def save(self, data: dict) -> Union[QuerySet, list[Compilation]]:
        compilations = []
        for item in data:
            comp = item['id']
            comp.queue = item['queue']
            comp.save()
            compilations.append(comp)
        return compilations

    def get_nomenclatures_queryset(self, pk: UUID) -> Union[QuerySet, list[Nomenclature]]:
        compilation = self._compilation_repository.get_by_id(pk)
        return Nomenclature.objects.annotate(
            status=Exists(compilation.nomenclatures.filter(id=OuterRef('pk')))
        ).order_by('-status', 'title')

    def create(self, serializer: CompilationCreateSerializer) -> CompilationCreateSerializer:
        max_queue = self._compilation_repository.get_max_queue()
        serializer.save(queue=max_queue + 1)
        return serializer
    
    def attach_category(self, compilation_pk: UUID, request_data: dict[str, str]) -> Compilation:
        try:
            compilation = Compilation.objects.get(id=compilation_pk)
        except:  # noqa: E722
            raise NotFoundException('compilation')
        nomenclatures = NomenclatureRelatedSerializer(data=request_data)
        if not nomenclatures.is_valid():
            raise NotFoundException('nomenclatures')
        nomenclature = nomenclatures.validated_data['nomenclature']
        compilation.nomenclatures.add(nomenclature)
        return compilation
