#from celery import shared_task
#from .models import Order
#from users.tasks import multitasker
#import httpx
#from django.conf import settings

# @multitasker
# @shared_task
# def create_order_1C(order: Order): # Возможно нельзя будет это делать асинхронно, и надо будет прямо внутри кода дожидаться ответа, чтобы сгенерить ссылку для оплаты из 1С..
from .models import ItemImage, Item, Parameter
from django.core.files.base import ContentFile
import xml.etree.ElementTree as ET
import httpx
from api.utils import slugify

client = httpx.Client(headers={
    'User-Agent': '1',
    'Host': 'b2b.utake.ru',
})

def save_image(url, image_name, item:Item):
    response = client.get(url)
    bytes = response.content
    content_file = ContentFile(bytes, name=image_name)
    image = ItemImage.objects.create(source=content_file, item=item)
    return image

def parse_xml_file(): # Импорт картинок есть, надо будет связать их с товаром, а также возможно делать это все асинхронно (с картинками). Помимо этого надо продумать работу характеристик, скрипт должен взять список из файла, скорее всего будет общий пул характеристик, который будет M2M с товарами, сравнения будут браться оттуда же.
    tree = ET.parse('C:/Users/Moose/Desktop/projects/kaleidoskop project/file.xml')  # Замените на путь к вашему XML-файлу
    root = tree.getroot()

    # Перейти к offers
    offers = root.find('.//offers')
    for offer in offers.findall('offer'):
        product = {
            'description': offer.findtext('description'),
            'pictures': [pic.text for pic in offer.findall('picture')],
            'article': offer.findtext('vendorCode'),
            'params': [{
                'attribute': param.attrib,
                'value': param.text
            } for param in offer.findall('param')]
        }

        db_product = Item.objects.filter(article=product['article']).first()
        if db_product is not None and not db_product.public:
            c = 0
            for url in product['pictures']:   
                c += 1         
                save_image(url, f'{db_product.slug}-{c}.png', db_product)
            if db_product.description is None:
                db_product.description = product['description']
            params = []
            for param in product['params']:
                attribute = param['attribute']
                if attribute['name'] == 'Штрихкод' or attribute['name'] == 'Код ТНВЭД':
                    continue
                parameter = Parameter()
                parameter.value = param['value']
                parameter.title = attribute['name']
                if 'unit' in attribute:
                    parameter.unit = attribute['unit']
                parameter.save()
                params.append(parameter)
            db_product.parameters.add(*params)
            db_product.public = True
            db_product.save()
            # print(product)
            # break