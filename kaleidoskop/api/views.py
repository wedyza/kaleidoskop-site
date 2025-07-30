from rest_framework import views, viewsets, permissions, status, mixins
from rest_framework.decorators import action
from django.conf import settings
from django.contrib.auth import get_user_model
from .serializers import CategorySerializer, ItemSerializer, LikeSerializer, CommentSerializer
from .models import Category, Item, Like, Comment

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class WishlistViewSet(viewsets.GenericViewSet,
                      mixins.ListModelMixin,
                      mixins.CreateModelMixin,
                      mixins.DestroyModelMixin):
    serializer_class = LikeSerializer
    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        return Like.objects.filter(user=self.request.user).all()
    

class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    queryset = Item.objects.all()


class CommentViewSet(viewsets.GenericViewSet,
                     mixins.CreateModelMixin,
                     mixins.DestroyModelMixin,
                     mixins.UpdateModelMixin,
                     mixins.RetrieveModelMixin):
    serializer_class = CommentSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
