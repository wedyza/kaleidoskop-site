from uuid import UUID
from repositories.user_repository import UserRepository
from services.cart_service import CartService
from api.models import Cart
from users.models import CustomAbstractUser

class UserService:
    _user_repository = UserRepository()
    _cart_service = CartService()
    
    def get_user_by_id(self, user_pk: UUID) -> CustomAbstractUser:
        return self._user_repository.get_by_id(user_pk)
    
    def fill_user_with_1c_data(self, user: CustomAbstractUser, code: str, existed: bool):
        self._user_repository.fill_user_with_1c_data(user, code, existed)
    
    def get_user_cart(self, user_pk: UUID) -> Cart:
        return self._cart_service.get_cart_by_user(user_pk)
    
    def get_user_by_email(self, email: str) -> CustomAbstractUser:
        return self._user_repository.get_user_by_email(email)
    
    def get_or_create_user_by_email(self, email: str) -> CustomAbstractUser:
        try:
            user = self.get_user_by_email(email)
        except:  # noqa: E722
            user = self._user_repository.create_user_with_email(email)
        return user
    
    def fill_user_otp(self, user: CustomAbstractUser, otp: str) -> CustomAbstractUser:
        return self._user_repository.fill_user_with_otp(user, otp)
    
    def check_user_otp(self, email: str, otp: str) -> CustomAbstractUser:
        user = self.get_user_by_email(email)
        return self._user_repository.check_regular_otp(user, otp)
    
    def check_email_is_free(self, email: str) -> bool:
        return self._user_repository.is_email_free(email)
    
    def start_email_change(self, user: CustomAbstractUser, email: str, otp: str):
        return self._user_repository.start_email_change(user, email, otp)
    
    def validate_user_email_change_otp(self, user: CustomAbstractUser, otp: str) -> bool:
        return self._user_repository.check_email_otp(user, otp)
