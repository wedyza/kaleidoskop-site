from api.models import Category, Item, Nomenclature, Order, Remains, Warehouse
from api.serializers import ItemSerializer
from django.db.models import Q

def get_or_create_item(item) -> tuple[Item, bool]:
    db_item = Item.objects.filter(
        Q(code=item["code"]) | Q(article=item["article"])
    ).first()
    if db_item is None:
        return Item(**item), True
    db_item.price = item["price"]
    db_item.title = item["title"]
    db_item.parent_code = item["parent_code"]
    db_item.article = item["article"]
    db_item.nomenclature = None
    return db_item, False


def get_or_create_remain(remain) -> tuple[Remains | None, bool]:
    if remain["order"] != "NULL":
        return None, False
    try:
        need_item = Item.objects.get(code=remain["code"])
    except Item.DoesNotExist:
        return None, False
    need_warehouse = Warehouse.objects.get(name=remain["warehouse"])
    db_remain = Remains.objects.filter(
        Q(item=need_item) & Q(warehouse=need_warehouse)
    ).first()
    if db_remain is None:
        return (
            Remains(item=need_item, warehouse=need_warehouse, count=remain["count"]),
            True,
        )
    db_remain.count = remain["count"]
    return db_remain, False


def fillup_nomenclatures_with_parents():
    """
    Заполняет родительские номенклатуры
    """
    nomenclatures = Nomenclature.objects.exclude(parent_code=None).filter(parent=None).all()
    for nomenclature in nomenclatures:
        try:
            nomenclature.parent = Nomenclature.objects.get(code=nomenclature.parent_code)
        except:
            pass
    Nomenclature.objects.bulk_update(nomenclatures, fields=["parent"])


def fillup_items_with_parents():
    """
    Заполняет значения предметов и их номенклатур
    """
    items = Item.objects.exclude(parent_code=None).filter(nomenclature=None).all()
    c = 0
    for item in items:
        c += 1
        try:
            item.nomenclature = Nomenclature.objects.get(code=item.parent_code)
        except:
            continue
    print('начинается булка')
    Item.objects.bulk_update(items, fields=["nomenclature"], batch_size=1000)

def create_new_items(data:list) -> bool: # Тут добавить обновление товаров помимо создания / Либо можно выгружать раз в день, как думал сделать раньше. Когда некст раз откроешь тут, лучше сесть делать заказы дальше. Также еще телеграм уведомления необходимо обернуть в контейнер, так же, как и рекомендации. Поместить все в контейнер и начать их работу в основном приложении. Также можно разметить характеристики наглядно и подумать насчет импорта картинок (поискать LLM и реализации в инете). Сейчас из задача окончить заказы и приьбраться в основном приложении
    """
    Создает не существующие в бд записи товаров
    """
    new_items = [Item(**item) for item in data]
    created = Item.objects.bulk_create(new_items, ignore_conflicts=True)
    return len(created) != 0

def create_new_nomenclatures(data:list) -> bool:
    """
    Создает не существующие в бд номенклатуры
    """
    new_nomenclatures = [Nomenclature(**nomenclature) for nomenclature in data]
    created = Nomenclature.objects.bulk_create(new_nomenclatures, ignore_conflicts=True)
    return len(created) != 0

def update_order_status(order: Order, status, agreed):
    if status == 'Закрыт':
        order.status = Order.OrderStatus.REALISED
    elif status == 'На согласовании':
        order.status = Order.OrderStatus.ON_APPROVE
    elif status == 'К выполнению / В резерве':
        order.status = Order.OrderStatus.ON_REALISATION
    elif status == 'Отменен':
        order.status = Order.OrderStatus.CANCELED
    else:
        order.status = Order.OrderStatus.APPROVED   
    order.save()