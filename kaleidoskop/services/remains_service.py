from repositories.remains_repository import RemainsRepository

class RemainsService:
    _remains_repository = RemainsRepository()
    
    def save_remains(self, data: dict[str, str]):
        self._remains_repository.save_remains(data)
