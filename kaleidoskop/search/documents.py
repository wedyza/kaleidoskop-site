from django.contrib.auth.models import User
from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry

from api.models import Category, Item

@registry.register_document
class ItemDocument(Document):
    category = fields.ObjectField(properties={
        'code': fields.TextField(),
        'title': fields.TextField()
    })
    
    class Index:
        name = 'items'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }

    class Django:
        model = Item
        fields = [
            'code',
            'article',
            'title',
            'country'
        ]
        related_models = [Category]

@registry.register_document
class CategoryDocument(Document):
    parent = fields.ObjectField(properties={
        'code': fields.TextField(),
        'title': fields.TextField()
    })

    class Index:
        name = 'categories'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }

    class Django:
        model = Category
        fields = [
            'title',
            'code'
        ]