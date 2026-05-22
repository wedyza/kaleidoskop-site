from io import BytesIO
from PIL import Image
from django.core.files import File
from api.models import Item, ItemImage
from django.core.files.base import ContentFile
import httpx

def compress_image(image):
    im = Image.open(image)
    width, height = im.size[0], int(im.size[0] * 1.5)
    x, y = 0, int((im.size[1] - height) // 2)
    area = (x, y, x+width, y+height)
    im = im.crop((area))
    im = im.resize((200, 300))
    im_bytes = BytesIO()
    im.save(fp=im_bytes, format="WEBP", quality=100)
    image_content_file = ContentFile(content=im_bytes.getvalue())
    name = image.name.split('.')[0] + '.WEBP'
    new_image = File(image_content_file, name=name)
    return new_image


def test():
    item = Item.objects.get(id="e590e630-6d19-4a17-81a6-56f78d8631a1")
    iimages = ItemImage.objects.filter(item=item).all()
    
    for image in iimages:
        if not image.source:
            continue
        
        with image.source.open('rb') as f: 
            original_bytes = f.read()
        
        content_file = ContentFile(original_bytes, name=image.source.name)
        
        compressed_image = compress_image(content_file)
        image.source.delete()
        image.source.save(compressed_image.name, compressed_image, save=False)
        image.save()
    return item.slug
