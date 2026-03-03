from api.models import Like
from uuid import UUID

class LikeRepository:
    def filter_like_by_user_id_and_item_id(self, item_pk: UUID, user_pk: UUID) -> Like | None:
        return Like.objects.filter(item_id=item_pk).filter(user_id=user_pk).first()

    def create_like(self, item_pk: UUID, user_pk: UUID) -> Like:
        like = Like.objects.create(item_id=item_pk, user_pk=user_pk)
        like.save()
        return like

    def delete_like(self, like: Like):
        like.delete()
    
    # def __create_or_delete_like(self, like: Like, status: bool) -> bool: # я вернусь сюда, когда доделаю корзину
    #     if like is not None and not status:
    #         like.delete()
    #     elif like is None and status:
    #         like = Like.objects.create(item_id=pk, user=request.user)
    #         like.save()
    #     return status

    def switch_like(self, item_pk: UUID, user_pk: UUID, status: bool) -> bool:
        like = self.filter_like_by_user_id_and_item_id(item_pk, user_pk)
        return self.__create_or_delete_like(like, status)
    
    def get_likes_of_user(self, user_pk: UUID):
        return Like.objects.filter(user_pk=user_pk).all()