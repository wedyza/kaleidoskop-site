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
    RemainsReceiveSerializer,
)
from .functions import fillup_nomenclatures_with_parents, fillup_items_with_parents
from django_elasticsearch_dsl.registries import registry
from search.documents import ItemDocument
from api.models import Item
from drf_yasg.utils import swagger_auto_schema

# Create your views here.


class ReceiveNomenclaturesView(APIView):
    swagger_schema = None
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        api_key = request.headers.get("x-api-key")
        if api_key != settings.API_KEY_1C:
            return Response(
                {"message": "You are not allowed to do this"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        # print(request.data)
        # print(json.dumps(request.data, ensure_ascii=False, indent=4))
        nomenclatures = NomenclatureCreateSerializer(data=request.data, many=True)
        if nomenclatures.is_valid():
            nomenclatures.save()
            fillup_nomenclatures_with_parents()
        else:
            print(nomenclatures.errors)
        parse_nomenclatures(request.data)
        return Response({"message": "hi"})


class ReceiveItemsView(APIView):
    swagger_schema = None
    permission_classes = (permissions.AllowAny,)
    
    def get(self, request):
        ItemDocument().update(Item.objects.all())
        return Response("hi")

    def post(self, request):
        api_key = request.headers.get("x-api-key")
        if api_key != settings.API_KEY_1C:
            return Response(
                {"message": "You are not allowed to do this"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        items = ItemCreateSerializer(data=request.data, many=True)
        if items.is_valid():
            items.save()
            fillup_items_with_parents()
            ItemDocument().update(Item.objects.all())
        else:
            print(items.errors)
        # print(json.dumps(request.data, ensure_ascii=False, indent=4))
        return Response()


class ReceiveRemainsView(APIView):
    swagger_schema = None
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        api_key = request.headers.get("x-api-key")
        if api_key != settings.API_KEY_1C:
            return Response(
                {"message": "You are not allowed to do this"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        remains = RemainsReceiveSerializer(data=request.data, many=True)
        if remains.is_valid():
            remains.save()
        else:
            print(remains.errors)

        return Response({"message": "done"}, status=status.HTTP_200_OK)
