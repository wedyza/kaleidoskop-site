from django.contrib.postgres.search import SearchVector
from django.db.models import F
from api.models import Item

# Допустим, что это просто для поиска, потом сделаем может быть автозаполнение

vector = SearchVector('title')
