from io import BytesIO
from PIL import Image
from django.core.files import File
from api.models import Item, ItemImage
from django.core.files.base import ContentFile
import httpx

def compress_image(image, quality=85):
    im = Image.open(image)
    width, height = im.size[0], int(im.size[0] * 1.5)
    x, y = 0, int((im.size[1] - height) // 2)
    area = (x, y, x+width, y+height)
    im = im.crop((area))
    im_bytes = BytesIO()
    im.save(fp=im_bytes, format="png", quality=quality, method=4)
    image_content_file = ContentFile(content=im_bytes.getvalue())
    name = image.name.split('.')[0] + '.png'
    new_image = File(image_content_file, name=name)
    return new_image
