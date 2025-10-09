from rest_framework import views, permissions, status
from drf_yasg import openapi
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
import httpx
from api.models import Item
from .tasks import train_content_based_model


class TestView(views.APIView):
    """
    Надо потом вынести в -> recommendation_system
    """
    permission_classes = (permissions.IsAuthenticated, )

    @swagger_auto_schema(manual_parameters=[
            openapi.Parameter('product_id', openapi.IN_QUERY, description='UUID продукта', type=openapi.TYPE_STRING),
            openapi.Parameter('n', openapi.IN_QUERY, description='Количество рекомендаций (default n = 10)', type=openapi.TYPE_INTEGER),
        ], operation_summary="Тестовый роут")
    def get(self, request):
        """
        Тестовая функция для отладки модели
        """
        if 'product_id' not in request.GET:
            return Response({"detail": "product_id must be in query!"}, status=status.HTTP_400_BAD_REQUEST)
        
        product_id = request.GET['product_id']
        n = 10 if 'n' not in request.GET else request.get['n']
        try:
            item = Item.objects.get(pk=product_id)
        except:
            return Response({"detail": "No item with that id!"}, status=status.HTTP_404_NOT_FOUND)
        
        response = httpx.post(
            url=f"http://localhost:8081/recommendations/content", json={"product_id": product_id, "n": n}
        )
        return Response(response.json(), status=response.status_code)
    

    @swagger_auto_schema(operation_summary="Обучение модели content-based модели")
    def post(self, request):
        """
        Обучение модели (content-based)
        """
        try:
            train_content_based_model()
        except httpx.ReadTimeout:
            return Response({"detail": "Обучение началось"}, status=status.HTTP_200_OK)
        except Exception as e:
            raise e
        pass