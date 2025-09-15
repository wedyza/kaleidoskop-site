from api.models import Category, Item, Nomenclature, Remains, Warehouse
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
    nomenclatures = Nomenclature.objects.exclude(parent_code=None).filter(parent=None).all()
    for nomenclature in nomenclatures:
        try:
            nomenclature.parent = Nomenclature.objects.get(code=nomenclature.parent_code)
        except:
            pass
    Nomenclature.objects.bulk_update(nomenclatures, fields=["parent"])


def fillup_items_with_parents():
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
