from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from services.receiver_service import ReceiverService
from .permissions import ContainsAPIKey

# Create your views here.

receiver_service = ReceiverService()

class ReceiveNomenclaturesView(APIView):
    # swagger_schema = None
    permission_classes = (ContainsAPIKey,)

    def post(self, request):
        receiver_service.sync_nomenclatures_with_1C()
        return Response(status=status.HTTP_200_OK)
    
    # # Тут надо будет понять, что именно меняется на приемке и менять
    # def put(self, request):
    #     return Response(status=status.HTTP_200_OK)

class ReceiveItemsView(APIView):
    # swagger_schema = None
    permission_classes = (ContainsAPIKey,)

    def post(self, request):
        receiver_service.sync_items_with_1C()
        return Response()
    
    # # Тут надо будет понять, что именно меняется на приемке и менять
    # def put(self, request): #
    #     return Response()


class ReceiveRemainsView(APIView):
    # swagger_schema = None
    permission_classes = (ContainsAPIKey,)


    def post(self, request):
        receiver_service.sync_remains_with_1C()
        return Response(status=status.HTTP_200_OK)
    
    # # Тут надо будет понять, что именно меняется на приемке и менять
    # def put(self, request):
    #     return Response()


class ReceiveOrderView(APIView):
    permission_classes = (ContainsAPIKey, )

    def post(self, request):
        try:
            receiver_service.update_order_status(request.data['code'], request.data['status'])
            return Response(status=status.HTTP_200_OK)
        except:  # noqa: E722
            return Response(stauts=status.HTTP_500_INTERNAL_SERVER_ERROR)
