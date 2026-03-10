from uuid import UUID
from users.models import CustomAbstractUser
from django.utils import timezone
from exceptions.exceptions import NotFoundException, OTPTimedOutException, WrongOTPPassedException

class UserRepository:
    def get_by_id(self, user_pk: UUID) -> CustomAbstractUser:
        return CustomAbstractUser.objects.get(id=user_pk)
    
    def fill_user_with_1c_data(self, user: CustomAbstractUser, code: str, existed: bool):
        if user.code is None:
            user.code = code
            user.previously_existed = existed
            user.save()
            
    def get_user_by_email(self, email: str) -> CustomAbstractUser:
        try:
            return CustomAbstractUser.objects.get(email=email)
        except:  # noqa: E722
            raise NotFoundException
    
    def create_user_with_email(self, email: str) -> CustomAbstractUser:
        return CustomAbstractUser.objects.create(email=email)
    
    def fill_user_with_otp(self, user: CustomAbstractUser, otp: str) -> CustomAbstractUser:
        user.otp = otp
        user.otp_expires = timezone.now() + timezone.timedelta(minutes=15)
        user.save()
        return user
    
    def is_email_free(self, email: str) -> bool:
        return not CustomAbstractUser.objects.filter(email=email.data["email"]).exists()

    def start_email_change(self, user: CustomAbstractUser, email: str, otp: str):
        user.email_to_change = email.data["email"]
        user.otp_change_email = otp
        user.otp_expires_change_email = timezone.now() + timezone.timedelta(minutes=15)
        user.save()
        
    def check_regular_otp(self, user: CustomAbstractUser, otp: str) -> CustomAbstractUser:
        if user.otp == otp:
            if timezone.now() > user.otp_expires:
                raise OTPTimedOutException
            
            user.otp = None
            user.otp_expires = None
            user.save()
            return user
        raise WrongOTPPassedException
    
    def check_email_otp(self, user: CustomAbstractUser, otp: str) -> bool:
        if user.otp_change_email == otp:
            if timezone.now() > user.otp_expires_change_email:
                raise OTPTimedOutException
            user.otp_change_email = None
            user.otp_expires_change_email = None
            user.email = user.email_to_change
            user.email_to_change = None
            user.save()
            return True
        return WrongOTPPassedException