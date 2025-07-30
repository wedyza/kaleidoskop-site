from api.models import Category, Item
from django.db.models import Q

def get_or_create_item(item):
    db_item = Item.objects.filter(Q(code=item['code']) | Q(article=item['article'])).first()
    if db_item is None:
        return Item(**item), True
    db_item.price = item['price']
    db_item.title = item['title']
    db_item.parent_code = item['parent_code']
    db_item.category = None
    return db_item, False

def fillup_categories_with_parents():
    categories = Category.objects.exclude(parent_code=None).filter(parent=None).all()
    for category in categories:
        try:
            category.parent = Category.objects.get(code=category.parent_code)
        except:
            pass
    Category.objects.bulk_update(categories, fields=['parent'])


def fillup_items_with_parents():
    items = Item.objects.exclude(parent_code=None).filter(category=None).all()
    for item in items:
        try:
            item.category = Category.objects.get(code=item.parent_code)
        except:
            pass
    Item.objects.bulk_update(items, fields=['category'])