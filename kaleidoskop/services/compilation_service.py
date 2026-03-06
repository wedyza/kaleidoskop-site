from admin_panel.models import Compilation, Nomenclature
from admin_panel.serializers import CompilationCreateSerializer
from repositories.compilation_repository import CompilationRepository
from uuid import UUID
from django.db.models import Exists, OuterRef

class CompilationService:
    __compilation_repository = CompilationRepository()

    def save(self, data: dict) -> list[Compilation]:
        compilations = []
        for item in data:
            comp = item['id']
            comp.queue = item['queue']
            comp.save()
            compilations.append(comp)
        return compilations

    def get_nomenclatures_queryset(self, pk: UUID) -> list[Nomenclature]:
        compilation = self.__compilation_repository.get_by_id(pk)
        return Nomenclature.objects.annotate(
            status=Exists(compilation.nomenclatures.filter(id=OuterRef('pk')))
        ).order_by('-status', 'title')

    def create(self, serializer: CompilationCreateSerializer) -> CompilationCreateSerializer:
        max_queue = self.__compilation_repository.get_max_queue()
        serializer.save(queue=max_queue + 1)
        return serializer