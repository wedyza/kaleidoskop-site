from uuid import UUID
from repositories.user_repository import UserRepository
from services.cart_service import CartService
from api.models import Cart
from users.models import CustomAbstractUser

class UserService:
    __user_repository = UserRepository()
    __cart_service = CartService()
    
    def get_user_by_id(self, user_pk: UUID) -> CustomAbstractUser:
        return self.__user_repository.get_by_id(user_pk)
    
    def fill_user_with_1c_data(self, user: CustomAbstractUser, code: str, existed: bool):
        self.__user_repository.fill_user_with_1c_data(user, code, existed)
    
    def get_user_cart(self, user_pk: UUID) -> Cart:
        return self.__cart_service.get_cart_by_user(user_pk)