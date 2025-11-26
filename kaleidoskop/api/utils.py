from django.template.defaultfilters import slugify as django_slugify
# import httpx
# from .models import Item


# Slugify (Cyrillic)
alphabet = {
    "а": "a",
    "б": "b",
    "в": "v",
    "г": "g",
    "д": "d",
    "е": "e",
    "ё": "yo",
    "ж": "zh",
    "з": "z",
    "и": "i",
    "й": "j",
    "к": "k",
    "л": "l",
    "м": "m",
    "н": "n",
    "о": "o",
    "п": "p",
    "р": "r",
    "с": "s",
    "т": "t",
    "у": "u",
    "ф": "f",
    "х": "kh",
    "ц": "ts",
    "ч": "ch",
    "ш": "sh",
    "щ": "shch",
    "ы": "i",
    "э": "e",
    "ю": "yu",
    "я": "ya",
}


def slugify(s):
    return django_slugify("".join(alphabet.get(w, w) for w in s.lower()))


# def importer():
#     url = 'https://b2b.utake.ru/wa-data/public/shop/products/13/16/21613/images/36830/36830.970.png'

#     client = httpx.Client(headers={
#         'User-Agent': '1',
#         'Host': 'b2b.utake.ru',
#         # 'Postman-Token': '1c3bc6a4-3d0f-486b-b8a4-7024a036c062'
#     })

#     response = client.get(url)

# #     item = Item.ob