from uuid import UUID
from users.models import CustomAbstractUser

class UserRepository:
    def get_by_id(self, user_pk: UUID) -> CustomAbstractUser:
        return CustomAbstractUser.objects.get(id=user_pk)
    
    def fill_user_with_1c_data(self, user: CustomAbstractUser, code: str, existed: bool):
        if user.code is None:
            user.code = code
            user.previously_existed = existed
            user.save()