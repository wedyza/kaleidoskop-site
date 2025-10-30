from rest_framework import views, status
from drf_yasg.utils import swagger_auto_schema
from rest_framework.response import Response
import redis
from .models import TelegramUser
from .serialiers import TelegramUserSerializer, SessionCodeSerializer
from django.core.exceptions import ValidationError
import pika
from .rabbitmq import RabbitMQ
# Когда вернешься -  надо сделать создание сообщений в RabbitMQ через pika (Producer) и Consumer'а в телеграмм боте, чтобы он принимал сообщения и отправлял их только нужным скорее всего через get endpoint будет ходить сюда за данными
r = redis.StrictRedis(
        host='localhost',  # из Endpoint
        port=6379,  # из Endpoint
        decode_responses=True
    )

rq = RabbitMQ()

class LinkTelegrammView(views.APIView):
    def get(self, request):
        return Response(TelegramUserSerializer(instance=TelegramUser.objects.all()).data)
    
    @swagger_auto_schema(request_body=SessionCodeSerializer)
    def post(self, request):
        code = SessionCodeSerializer(data=request.data)
        if not code.is_valid():
            raise ValidationError(code.errors)
        
        try:
            code = code.data['code']
            chat_id = r.get(code)
            
            if chat_id is None:
                return Response({"detail": "Did not found session"}, status=status.HTTP_404_NOT_FOUND)
            
            rq.publish(action="new_session", message=f"{chat_id}")
            return Response({'chat_id': chat_id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            raise e

