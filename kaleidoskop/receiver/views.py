from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework import permissions
from .tasks import parse_nomenclatures
from django.conf import settings
import json
from .serializers import (
    NomenclatureCreateSerializer,
    ItemCreateSerializer,
    OrderReceiveSerializer,
    RemainsReceiveSerializer,
)
from .functions import fillup_nomenclatures_with_parents, create_new_nomenclatures, fillup_items_with_parents, create_new_items, update_order_status
from django_elasticsearch_dsl.registries import registry
from search.documents import ItemDocument
from api.models import Item, Order
from drf_yasg.utils import swagger_auto_schema
from users.tasks import sync_items, sync_nomenclatures, sync_remains
from .permissions import ContainsAPIKey

# Create your views here.


class ReceiveNomenclaturesView(APIView):
    # swagger_schema = None
    permission_classes = (permissions.AllowAny,) # Сделать потом тут только для 1С по ключу -> написать свой permissions

    def post(self, request):
        data = sync_nomenclatures()
        created = create_new_nomenclatures(data)
        if created:
            fillup_nomenclatures_with_parents()
        # parse_nomenclatures(request.data)
        return Response({"message": "hi"})
    
    # Тут надо будет понять, что именно меняется на приемке и менять
    def put(self, request):
        return Response()

class ReceiveItemsView(APIView):
    # swagger_schema = None
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        data = sync_items()
        created = create_new_items(data)
        if created:
            fillup_items_with_parents()
            # ItemDocument().update(Item.objects.all())
        return Response()
    
    # Тут надо будет понять, что именно меняется на приемке и менять
    def put(self, request): #
        return Response()


class ReceiveRemainsView(APIView):
    # swagger_schema = None
    permission_classes = (ContainsAPIKey,)

    def post(self, request):
        data = sync_remains()
        remains = RemainsReceiveSerializer(data=data, many=True)
        if remains.is_valid():
            remains.save()
        else:
            print(remains.errors)

        return Response({"message": "done"}, status=status.HTTP_200_OK)
    
    # Тут надо будет понять, что именно меняется на приемке и менять
    def put(self, request):
        return Response()


class ReceiveOrderView(APIView):
    permission_classes = (ContainsAPIKey, )

    def post(self, request):
        order = Order.objects.filter(code=request.data['code']).first()
        print(request.data)
        if order is None:
            return Response('error')
        
        update_order_status(order, request.data['status'], request.data['agreed'])
        return Response()


class ReceiveTestView(APIView):
    def post(self, request):
        print(request.data)
        return Response({"message": "success"})
    