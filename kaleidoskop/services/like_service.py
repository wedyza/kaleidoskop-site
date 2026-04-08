from typing import Union
from api.models import Like
from uuid import UUID
from repositories.like_repository import LikeRepository
from django.db.models import QuerySet

class LikeService:
    _like_repository = LikeRepository()

    def switch_like(self, item_pk:UUID, user_pk: UUID, status: bool) -> bool:
        like = self._like_repository.filter_like_by_user_id_and_item_id(item_pk, user_pk)
        if like is None and status:
            self._like_repository.create_like(item_pk, user_pk)
        elif like is not None and not status:
            self._like_repository.delete_like(like)
        return status
    
    def get_likes_of_user(self, user_pk: UUID) -> Union[QuerySet, list[Like]]:
        return self._like_repository.get_likes_of_user(user_pk)
