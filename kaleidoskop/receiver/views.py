from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework import permissions
from .tasks import parse_categories
from django.conf import settings
import json
from .serializers import CategoryCreateSerializer, ItemCreateSerializer, RemainsReceiveSerializer
from .functions import fillup_categories_with_parents, fillup_items_with_parents
# Create your views here.

class ReceiveCategoriesView(APIView):
    permission_classes = (permissions.AllowAny, )

    def post(self, request):
        api_key = request.headers.get("x-api-key")
        if api_key != settings.API_KEY_1C:
            return Response({"message": "You are not allowed to do this"}, status=status.HTTP_401_UNAUTHORIZED)
        # print(request.data)
        categories = CategoryCreateSerializer(data=request.data, many=True)
        if categories.is_valid():
            categories.save()
            fillup_categories_with_parents()
        else:
            print(categories.errors)
        # parse_categories.delay(request.data)
        return Response({'message': 'hi'})


class ReceiveItemsView(APIView):
    permission_classes = (permissions.AllowAny, )

    def post(self, request):
        api_key = request.headers.get("x-api-key")
        if api_key != settings.API_KEY_1C:
            return Response({"message": "You are not allowed to do this"}, status=status.HTTP_401_UNAUTHORIZED)
        items = ItemCreateSerializer(data=request.data, many=True)
        if items.is_valid():
            items.save()
            fillup_items_with_parents()
        else:
            print(items.errors)
        # print(json.dumps(request.data, ensure_ascii=False, indent=4))
        return Response()
    

class ReceiveRemainsView(APIView):
    permission_classes = (permissions.AllowAny, )

    def post(self, request):
        api_key = request.headers.get("x-api-key")
        if api_key != settings.API_KEY_1C:
            return Response({"message": "You are not allowed to do this"}, status=status.HTTP_401_UNAUTHORIZED)
        
        remains = RemainsReceiveSerializer(data=request.data, many=True)
        if remains.is_valid():
            remains.save()
        else:
            print(remains.errors)
        
        return Response({"message": "done"}, status=status.HTTP_200_OK)