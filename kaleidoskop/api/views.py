from rest_framework import views, viewsets, permissions, status, mixins, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from django.contrib.auth import get_user_model
from .paginators import CustomPagination
from .serializers import CategorySerializer, ItemSerializer, LikeSerializer, CommentSerializer, SwitchSerializer, UserSerializer
from .models import Category, Item, Like, Comment
from django_filters.rest_framework import DjangoFilterBackend

User = get_user_model()

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = CustomPagination
    #permissions = (AdminOrReadOnly, )
    filter_backends = [filters.SearchFilter]
    search_fields = ("title",)

    @action(methods=["GET"], detail=True, url_path="items", pagination_class=CustomPagination)
    def get_items(self, request, pk):
        category = Category.objects.get(id=pk)
        items = Item.objects.filter(category=category).all()
        page = self.paginate_queryset(items)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)



class WishlistViewSet(viewsets.GenericViewSet,
                      mixins.ListModelMixin):
    serializer_class = LikeSerializer
    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        return Like.objects.filter(user=self.request.user).all()
    

class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    queryset = Item.objects.all()

    @action(
        detail=True,
        methods=["POST"],
        url_path="switch_wishlist",
        permission_classes=(permissions.IsAuthenticated,),
        serializer_class=SwitchSerializer
    )
    def switch_wishlist(self, request, pk):
        status = self.get_serializer(data=request.data)

        if not status.is_valid():
            return Response(status.errors)
        like = Like.objects.filter(item_id=pk).filter(user=request.user).first()
        if like is not None and not status.data["enable"]:
            like.delete()
        elif like is None and status.data["enable"]:
            like = Like.objects.create(item_id=pk, user=request.user)
            like.save()
        return Response({"enable": status.data["enable"]})

class CommentViewSet(viewsets.GenericViewSet,
                     mixins.CreateModelMixin,
                     mixins.DestroyModelMixin,
                     mixins.UpdateModelMixin,
                     mixins.RetrieveModelMixin):
    serializer_class = CommentSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    queryset = Comment.objects.all()


class UsersViewSet(viewsets.GenericViewSet, mixins.DestroyModelMixin, mixins.UpdateModelMixin, mixins.RetrieveModelMixin):
    serializer_class = UserSerializer
    # permission_classes = 
    queryset = User.objects.all()

    @action(detail=False, methods=['GET', 'PATCH'], permission_classes=(permissions.IsAuthenticated,), url_path="me")
    def active_user(self, request):
        if request.method == 'GET':
            serializer = self.serializer_class(request.user)
            return Response(serializer.data)
        serializer = self.serializer_class(
            request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors)