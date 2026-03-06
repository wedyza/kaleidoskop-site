from uuid import UUID
from django.conf import settings
from celery import shared_task
from services.user_service import UserService
import httpx

def multitasker(f): #Позволяет не бегать туда сюда и менять лишь 1 значение
    """
    Декоратор, который управляет запуском тасков
    Если settings.CONTAINER_LAUNCHER = True, то запускает их в Celery Worker,
    Иначе как обычную функцию
    """
    def wrapper(*args, **kwargs):
        if settings.CONTAINER_LAUNCHER:
            return f.delay(*args, **kwargs)
        return f(*args, **kwargs)
    return wrapper

class IntegrationService:
    __user_service = UserService()
    client = httpx.Client(auth=httpx.BasicAuth(username=settings.USER_1C, password=settings.PASSWORD_1C))
    LINK_1C = settings.SERVER_1C
    API_KEY = settings.API_KEY_1C
    
    @multitasker
    @shared_task
    def sync_user_with_1C(self, user_pk: UUID):
        """
        Асинхронно обновляет пользователя в 1С системе по его текущим, вызывать при UPDATE users/me/
        """
        user = self.__user_service.get_user_by_id(user_pk)
        response = self.client.put(
            self.LINK_1C + '/users',
            params={
                "API_KEY": self.API_KEY
                }, 
            json={
                "existed": user.previously_existed,
                "code": user.code,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "middle_name": user.middle_name,
                "phone_number": user.phone_number,
                "email": user.email
            },
            timeout=60
        )
        if response.status_code == 200:
            response = response.json()
            self.__user_service.fill_user_with_1c_data(user, response['code'].strip(), response['existed'])


    def create_order_1c(self, order_serializer: dict[str, str]) -> dict[str, str]:
        """
        Отправляет заказ в 1С
        """
        response = self.client.post(
                self.LINK_1C + '/orders/',
                json= order_serializer,
                timeout=15
            )
        return response.json()
    
    
    @multitasker
    @shared_task
    def delete_order_1c(self, order_code):
        self.client.request(
            method="DELETE",
            url=self.LINK_1C + '/orders/',
            json={
                'code': order_code
            },
            timeout=15
        )
        
    def sync_nomenclatures(self) -> dict[str, str]:
        response = self.client.get(
            self.LINK_1C + '/nomenclatures/',
            params={"API_KEY": self.API_KEY},
            timeout=60
        )
        if response.status_code != 200:
            raise BaseException("something went wrong")
        return response.json()
    
    def sync_items(self):
        response = self.client.get(
            self.LINK_1C + '/items/',
            params={"API_KEY": self.API_KEY},
            timeout=60
        )
        if response.status_code != 200:
            raise BaseException("something went wrong")
        items = response.json()
        return items
    
    def sync_remains(self):
        response = self.client.get(
            self.LINK_1C + '/remains/',
            params={"API_KEY": self.API_KEY},
            timeout=15
        )
        if response.status_code != 200:
            raise BaseException("somethign went wrong")
        return response.json()
