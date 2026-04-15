from typing import Union
from django.db.models import Exists, OuterRef, QuerySet
from admin_panel.models import Compilation
from uuid import UUID
from api.models import Nomenclature

class CompilationRepository:
    def get_by_id(self, id: UUID) -> Compilation:
        return Compilation.objects.get(id=id)
    
    def get_max_queue(self) -> int:
        max_queue = Compilation.objects.order_by('-queue').first()
        if max_queue is None:
            return 0
        return max_queue.queue

    def save(self, data: dict) -> Union[QuerySet, list[Compilation]]:
        compilations = []
        for item in data:
            comp = item['id']
            comp.queue = item['queue']
            comp.save()
            compilations.append(comp)
        return compilations

    def get_nomenclatures_queryset(self, pk: UUID) -> Union[QuerySet, list[Nomenclature]]:
        compilation = self.get_by_id(pk)
        return Nomenclature.objects.annotate(
            status=Exists(compilation.nomenclatures.filter(id=OuterRef('pk')))
        ).order_by('-status', 'title')
