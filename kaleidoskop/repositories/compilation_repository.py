from admin_panel.models import Compilation
from uuid import UUID

class CompilationRepository:
    def get_by_id(self, id: UUID) -> Compilation:
        return Compilation.objects.get(id=id)
    
    def get_max_queue(self) -> int:
        max_queue = Compilation.objects.order_by('-queue').first()
        if max_queue is None:
            return 0
        return max_queue.queue
