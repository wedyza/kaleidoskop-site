from celery import shared_task
from services.integration_service import IntegrationService, multitasker
from services.nomenclature_service import NomenclatureService
from services.item_service import ItemService
from services.remains_service import RemainsService
from services.order_service import OrderService

class ReceiverService:
    _integration_service = IntegrationService()
    _nomenclature_service = NomenclatureService()
    _item_service = ItemService()
    _remains_service = RemainsService()
    _order_service = OrderService()

    @multitasker
    @shared_task
    def sync_nomenclatures_with_1C(self): # Надо будет сделать при помощи LIMIT|OFFSET и async зарпосы посылать сразу несколько и получать их, далее уже формировать на этой основе товары
        data = self._integration_service.sync_nomenclatures()
        self._nomenclature_service.fill_nomenclatures_from_1C(data)
        
    @multitasker
    @shared_task
    def sync_items_with_1C(self):
        data = self._integration_service.sync_items()
        self._item_service.create_new_items(data)
        
        
    @multitasker
    @shared_task
    def sync_remains_with_1C(self):
        data = self._integration_service.sync_remains()
        self._remains_service.save_remains(data)
        
    @multitasker
    @shared_task
    def update_order_status(self, order_code: str, status: str):
        self._order_service.update_order_status(order_code, status)
