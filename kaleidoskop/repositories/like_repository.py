from django.db.models import QuerySet
from api.decorators import cache_queryset
from api.enums import CacheKeyType
from api.models import Like
from uuid import UUID

class LikeRepository:
    def filter_like_by_user_id_and_item_id(self, item_pk: UUID, user_pk: UUID) -> Like | None:
        return Like.objects.filter(item_id=item_pk).filter(user_id=user_pk).first()
    
    def create_or_delete_like(self, like: Like | None, status: bool, item_pk: UUID, user_pk: UUID) -> bool:
        if like is not None and not status:
            like.delete()
        elif like is None and status:
            like = Like.objects.create(item_id=item_pk, user_id=user_pk)
            like.save()
        return status

    def switch_like(self, item_pk: UUID, user_pk: UUID, status: bool) -> bool:
        like = self.filter_like_by_user_id_and_item_id(item_pk, user_pk)
        return self.create_or_delete_like(like, status, item_pk, user_pk)
    
    def get_likes_of_user(self, user_pk: UUID) -> QuerySet:
        return Like.objects.filter(user_id=user_pk).all()
    
    # @cache_queryset(cache_key="liked_user_item", cache_key_type=CacheKeyType.BUILDING)
    def is_user_liked_item(self, user_pk: UUID, item_pk: UUID) -> bool:
        return Like.objects.filter(user_id=user_pk).filter(item_id=item_pk).exists()
