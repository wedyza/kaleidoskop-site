from integration_service import multitasker
from celery import shared_task
from services.integration_service import IntegrationService
from services.nomenclature_service import NomenclatureService
from services.item_service import ItemService
from services.remains_service import RemainsService
from services.order_service import OrderService

class ReceiverService:
    """
    Тут скорее всего на некоторые навесить scheduler, а некоторые так дергать
    """
    __integration_service = IntegrationService()
    __nomenclature_service = NomenclatureService()
    __item_service = ItemService()
    __remains_service = RemainsService()
    __order_service = OrderService()
    
    @multitasker
    @shared_task
    def sync_nomenclatures_with_1C(self): 
        data = self.__integration_service.sync_nomenclatures()
        self.__nomenclature_service.fill_nomenclatures_from_1C(data)
        
    @multitasker
    @shared_task
    def sync_items_with_1C(self):
        data = self.__integration_service.sync_items()
        self.__item_service.create_new_items(data)
        
        
    @multitasker
    @shared_task
    def sync_remains_with_1C(self):
        data = self.__integration_service.sync_remains()
        self.__remains_service.save_remains(data)
        
    @multitasker
    @shared_task
    def update_order_status(self, order_code: str, status: str):
        self.__order_service.update_order_status(order_code, status)
