from typing import Union
from django.db.models import Q
from admin_panel.models import Compilation, Nomenclature
from exceptions.exceptions import NotFoundException
from api.models import Item
from repositories.compilation_repository import CompilationRepository
from uuid import UUID
from django.db.models import QuerySet
from django.utils import timezone

class CompilationService:
    _compilation_repository = CompilationRepository()

    def get_public_queryset(self) -> Union[QuerySet, list[Compilation]]:
        today = timezone.now()
        queryset = Compilation.objects.filter(active=True).filter(Q(end_time=None) | Q(end_time__lte=today)).order_by('-queue')
        return queryset

    def save(self, data: dict) -> Union[QuerySet, list[Compilation]]:
        return self._compilation_repository.save(data=data)

    def get_nomenclatures_queryset(self, pk: UUID) -> Union[QuerySet, list[Nomenclature]]:
        return self._compilation_repository.get_nomenclatures_queryset(pk=pk)

    def create(self, serializer):
        max_queue = self._compilation_repository.get_max_queue()
        serializer.save(queue=max_queue + 1)
        return serializer
    
    def attach_nomenclature(self, compilation_pk: UUID, request_data: dict[str, str]) -> Compilation: # Костыль наверн
        from admin_panel.serializers import NomenclatureRelatedSerializer
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

    def get_compilation_items(self, pk: UUID) -> Union[QuerySet, list[Item]]:
        return self._compilation_repository.get_compilation_items(pk=pk)
    
    def get_compilation_items_count(self, pk: UUID)-> int:
        return self._compilation_repository.get_compilation_items(pk=pk).count()