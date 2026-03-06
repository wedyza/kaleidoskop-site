from repositories.remains_repository import RemainsRepository

class RemainsService:
    __remains_repository = RemainsRepository()
    
    def save_remains(self, data: dict[str, str]):
        self.__remains_repository.save_remains(data)
