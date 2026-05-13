from django.core.management.base import BaseCommand
from api.models import Brand, ItemImage, Item, Parameter, ParameterItem, Shop, Warehouse
from django.core.files.base import ContentFile
import xml.etree.ElementTree as ET
import httpx
from uuid import uuid4
from django.db.models import Q
import pandas as pd
from django.db import transaction
from pathlib import Path

class Command(BaseCommand):
    help = "Парсит медиа дату для товаров"
    client = httpx.Client(headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive"
    }, follow_redirects=True)

    def save_image(self, url, image_name, item:Item):
        if '.jpg' not in url and '.png' not in url and '.jpeg' not in url:
            return
        try:
            response = self.client.get(url)
            bytes = response.content
            if response.status_code != 200:
                print(url, image_name, item)
                return
            content_file = ContentFile(bytes, name=image_name)
            image = ItemImage.objects.create(source=content_file, item=item) # Если надо куда-то дальше картинку
            
        except Exception as e:
            print(e)
        return


    def parse_xml_file(self): # Надо будет придумать путь до файлов, возможно надо будет поместить их внутрь django приложения (дополнительный вес незачем, но это нужно для парсинга и инициализации приложения)
        tree = ET.parse('~/projects/kaleidoskop-site/file.xml') # Пока что заглушка
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

            barcode = ""
            for i in product['params']:
                if i['attribute']['name'] == 'Штрихкод':
                    barcode = i['value']
                    break
            db_product = Item.objects.filter(Q(barcode=barcode) | Q(article=product['article'])).first()
            if db_product is not None:
                c = 0
                for i in db_product.images.all():
                    i.delete()
                for url in product['pictures']:   
                    c += 1         
                    self.save_image(url, f'{db_product.slug}-{c}.png', db_product)
                if db_product.description is None:
                    db_product.description = product['description']
                for param in product['params']:
                    attribute = param['attribute']
                    name = attribute['name']
                    unit = attribute['unit'] if 'unit' in attribute else None
                    if name == 'Штрихкод' or name == 'Код ТНВЭД':
                        continue
                    parameter = Parameter.objects.filter(title=name).filter(unit=unit).first()
                    if parameter is None:
                        parameter = Parameter.objects.create(title=name, unit=unit)
                    parameter_item = ParameterItem.objects.create(item=db_product, parameter=parameter, value=param['value'])
                db_product.public = True
                db_product.save()


    def parse_garden_characteristics_file(self):
        tree = ET.parse('~/projects/kaleidoskop-site/export_universal_2025-12-02_1764703254_6624003807.xml')  # Замените на путь к вашему XML-файлу
        root = tree.getroot()

        offers = root.findall('offer')
        c = 0
        for offer in offers:
            c += 1
            product = {
                'description': offer.findtext('description'),
                'okdp': offer.findtext('okdp'),
                'brand': offer.findtext('brand'),
                'country': offer.findtext('country'),
                'vendor_code': offer.findtext('vendor_code'),
                'barcode': offer.findtext('barcode')
            }

            db_product = Item.objects.filter(Q(barcode=product['barcode']) | Q(article=product['vendor_code'])).first()
            if db_product is not None:
                if db_product.description == None:
                    db_product.description = product['description']

                if product['brand'] is not None:
                    brand = Brand.objects.filter(title=product['brand']).first()
                    if brand is None:
                        brand = Brand.objects.create(title=product['brand'])
                    db_product.brand = brand

                db_product.country = product['country']
                db_product.public = True
                db_product.okdp = product['okdp']

                db_product.save()
    

    def parse_garden_media_file(self):
        df = pd.read_csv('~/projects/kaleidoskop-site/export_media_2025-11-27_1764259311_6624003807.csv', delimiter=';')
        for index, row in df.iterrows():
            product = Item.objects.filter(okdp=row['okdp']).first()
            if product is not None:
                for i in product.images.all():
                    i.delete()
                for url in row['url'].split(';'):
                    print(url)
                    self.save_image(url, f'{product.slug}-{uuid4()}.png', product)
                    return

    
    def parse_catalog_xml(self, path: str):
        path = Path(path)
        text = path.read_text(encoding="windows-1251", errors="replace")
        root = ET.fromstring(text)
        for doc in root.findall("DocDetail"):
            item = {}
            item["sender_code"] = (doc.findtext("SenderPrdCode") or "").strip()
            ean = doc.find('.//EAN/Value')
            item['barcode'] = ean.text if ean is not None else None
            if item["barcode"] is None:
                continue
            db_item = Item.objects.filter(barcode=item['barcode']).first()
            if db_item is not None:
                item["description"] = (doc.findtext("ProductDescription") or "").strip()
                item["brand"] = (doc.findtext("Brand") or "").strip()
                item["country"] = (doc.findtext("Country/Value") or "").strip()
                # item["guarantee"] = (doc.findtext("GuaranteePeriod") or "").strip()
                # item["uom"] = (doc.findtext("UOM") or "").strip()
                # item["items_per_unit"] = (doc.findtext("ItemsPerUnit") or "").strip()
                # item["multiplicity"] = (doc.findtext("Multiplicity") or "").strip()

                # item["parent_code"] = (doc.findtext("ParentProdCode") or "").strip()
                # item["parent_group"] = (doc.findtext("ParentProdGroup") or "").strip()
                # item["product_code"] = (doc.findtext("ProductCode") or "").strip()
                # item["product_group"] = (doc.findtext("ProductGroup") or "").strip()

                # вес и габариты
                # item["weight"] = (doc.findtext("Weight/Value") or "").strip()
                # item["weight_unit"] = (doc.findtext("Weight/WeightUnit") or "").strip()

                # item["dimension_unit"] = (doc.findtext("Dimension/DimensionUnit") or "").strip()
                # item["depth"] = (doc.findtext("Dimension/Depth") or "").strip()
                # item["width"] = (doc.findtext("Dimension/Width") or "").strip()
                # item["height"] = (doc.findtext("Dimension/Height") or "").strip()

                # изображения (список URL)
                item["images"] = [
                    v.text.strip()
                    for v in doc.findall("Image/Value")
                    if v.text
                ]

                features = []
                for f in doc.findall("FeatureETIMDetails/FeatureETIM"):
                    name = (f.findtext("FeatureName") or "").strip()
                    value = (f.findtext("FeatureValue") or "").strip()
                    uom = (f.findtext("FeatureUom") or "").strip()
                    if name or value or uom:
                        features.append(
                            {"name": name, "value": value, "uom": uom}
                        )

                db_item.parameters.all().delete()
                for feature in features:
                    parameter = Parameter.objects.filter(title=feature["name"], unit=feature["uom"]).first()
                    if parameter is None:
                        parameter = Parameter.objects.create(title=feature["name"], unit=feature['uom'])
                    parameter_item = ParameterItem.objects.create(parameter=parameter, item=db_item, value=feature['value'])
                
                db_item.description = item['description']
                db_item.country = item['country']
                db_item.public = True
                brand = Brand.objects.filter(title=item['brand']).first()
                if brand is None:
                    brand = Brand.objects.create(title=item['brand'])

                db_item.brand = brand
                index = 0
                
                for i in db_item.images.all():
                    i.delete()

                for url in item['images']:
                    self.save_image(url, f'{db_item.slug}--{index}.png', db_item)
                    index += 1
                db_item.save()
            # связанные товары и аналоги, может быть полезно для формирования связных товаров в будущем
            # item["related"] = [
            #     n.text.strip()
            #     for n in doc.findall("RelatedProd/ItemCode")
            #     if n.text
            # ]
            # item["analogs"] = [
            #     n.text.strip()
            #     for n in doc.findall("Analog/ItemCode")
            #     if n.text
            # ]

            # характеристики ETIM как список словарей

    def initialize_warehouses(self):
        if Warehouse.objects.all().count() > 0:
            return
        data = ['Склад Малышева', 'Склад ТРЦ', 'Склад Выставка', 'Склад Сервисный Центр', 'Склад Скорынина 6', 'Склад Мальского Лесной', 'Склад Оптовый Ленина 117', 'Склад Ленина', 'Склад База Малышева', 'Основной склад']
        warehouses = [Warehouse.objects.create(name=n, custom_name=n) for n in data]
    
    def initialize_shops(self):
        if Shop.objects.all().count() > 0:
            return
        data = [
            {
                'city': 'Нижняя Тура',
                'street': 'Ленина',
                'house': 108,
                'longtitude': 58.632248,
                'latitude': 59.812652,
                'title': 'Магазин в Нижней Туре, на Ленина 108'
            },
            {
                'city': 'Нижняя Тура',
                'street': 'Малышева',
                'house': 13,
                'longtitude': 58.619483,
                'latitude': 59.870563,
                'title': 'Магазин в Нижней Туре, на Малышева 13'
            },
            {
                'city': 'Лесной',
                'street': 'Мальского',
                'house': 11,
                'longtitude': 58.625351,
                'latitude': 59.772295,
                'title': 'Магазин в Лесном, на Мальского 11'
            },
            {
                'city': 'Нижняя Тура',
                'street': 'Скорынина',
                'house': 6,
                'longtitude': 58.622526,
                'latitude': 59.854834,
                'title': 'Магизин Товары для дома, на Скорынина 6'
            }
        ]
        cities = [Shop.objects.create(**shop) for shop in data]

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Начало инициализации:"))
        try:
            self.stdout.write(self.style.NOTICE("Начало первого этапа:"))
            self.parse_xml_file()
            self.stdout.write(self.style.SUCCESS("Успешно пройден первый этап"))            
        except Exception as e:
            self.stdout.write(self.style.ERROR("Возникла ошибка во время парсинга первого этапа!"))
            raise e

        try:
            self.stdout.write(self.style.NOTICE("Начало второго этапа:"))
            self.parse_garden_characteristics_file()
            self.parse_garden_media_file()
            self.stdout.write(self.style.SUCCESS("Успешно пройден второй этап"))            
        except Exception as e:
            self.stdout.write(self.style.ERROR("Возникла ошибка во время парсинга второго этапа!"))
            raise e

        
        try:
            self.stdout.write(self.style.NOTICE("Начало третьего этапа:"))
            self.parse_catalog_xml(path='~/projects/kaleidoskop-site/PRODAT_369147_1221079811.xml')
            self.parse_catalog_xml(path='~/projects/kaleidoskop-site/PRODAT_369147_1221092775.xml')
            self.stdout.write(self.style.SUCCESS("Успешно пройден третий этап"))            
        except Exception as e:
            self.stdout.write(self.style.ERROR("Возникла ошибка во время парсинга третьего этапа!"))
            raise e

        self.stdout.write(self.style.NOTICE("Начало инициализации магазинов:")) # Перестроить также синхронизацию
        self.initialize_warehouses()
        self.initialize_shops()
        self.stdout.write(self.style.SUCCESS("Успешное завершение полной инициализации"))            
        