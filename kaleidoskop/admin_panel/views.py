from rest_framework import views, status, viewsets, permissions, mixins, filters
from drf_yasg.utils import swagger_auto_schema
from rest_framework.response import Response
from rest_framework.decorators import action
import redis
from .serializers import BannerQueueSerializer, CompilationCreateSerializer, CompilationQueueSerializer, CompilationSerializer, CreateNomenclatureCategorySerializer, DetailSerializer, NomenclatureCompilationSerializer, NomenclatureRelatedSerializer, SessionCodeSerializer, BannerSerializer, NomenclatureCategorySerializer, NomenclatureSerializer, AdminCategorySerializer
from django.core.exceptions import ValidationError
from django.db.models import Exists, OuterRef
from .rabbitmq import RabbitMQ
from django.conf import settings
from api.models import Banner, Category, Nomenclature, NomenclatureCategory
from .models import Compilation
from drf_yasg import openapi
from .filters import IsAssignedFilter
from rest_framework.parsers import MultiPartParser
from api.functions import get_nomenclatures
from api.paginators import CustomPagination
import django


class LinkTelegrammView(views.APIView):
    @swagger_auto_schema(request_body=SessionCodeSerializer)
    def post(self, request):
        
        r = redis.StrictRedis(
                host=settings.REDIS_HOST,  # из Endpoint
                port=6379,  # из Endpoint
                decode_responses=True
            )

        rq = RabbitMQ()

        code = SessionCodeSerializer(data=request.data)
        if not code.is_valid():
            raise ValidationError(code.errors)
        
        try:
            code = code.data['code']
            chat_id = r.get(code)
            
            if chat_id is None:
                return Response({"detail": "Did not found active session with that number"}, status=status.HTTP_404_NOT_FOUND)
            
            rq.publish(action="new_session", message=f"{chat_id}")
            return Response({'chat_id': chat_id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            raise e

class BannerViewSet(viewsets.GenericViewSet, mixins.UpdateModelMixin, mixins.DestroyModelMixin):
    queryset = Banner.objects.all()
    swagger_tags = ['admin_panel/banner']
    permission_classes = (permissions.AllowAny,)
    serializer_class = BannerSerializer

    @swagger_auto_schema(request_body=BannerQueueSerializer(many=True), responses={200: BannerSerializer(many=True)})
    @action(methods=['PATCH'], detail=False, url_path='first_group/save', serializer_class=BannerQueueSerializer)
    def save_first_group(self, request):
        banners = []

        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        
        for item in serializer.validated_data:
            banner = item['id']
            if banner.groupt_type == Banner.BannerGroupType.FIRST:
                banner.queue = item['queue']
                banner.save()
                banners.append(banner)
        
        return Response(BannerSerializer(instance=banners, many=True).data)

    @swagger_auto_schema(request_body=BannerQueueSerializer(many=True), responses={200: BannerSerializer(many=True)})
    @action(methods=['PATCH'], detail=False, url_path='second_group/save')
    def save_second_group(self, request):
        banners = []

        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        
        for item in serializer.validated_data:
            banner = item['id']
            if banner.groupt_type == Banner.BannerGroupType.SECOND:
                banner.queue = item['queue']
                banner.save()
                banners.append(banner)
        
        return Response(BannerSerializer(instance=banners, many=True).data)

    @action(methods=['POST'], detail=False, url_path='first_group/upload', parser_classes=[MultiPartParser])
    def upload_banner_first_group(self, request):
        banner = self.get_serializer(data=request.data)
        banner.is_valid(raise_exception=True)
        max_queue = Banner.objects.filter(group_type=Banner.BannerGroupType.FIRST).order_by('-queue').first()
        banner.save(group_type=Banner.BannerGroupType.FIRST, queue=max_queue.queue + 1)
        return Response(banner.data)
    
    @action(methods=['POST'], detail=False, url_path='second_group/upload', parser_classes=[MultiPartParser])
    def upload_banner_second_group(self, request):
        banner = self.get_serializer(data=request.data)
        banner.is_valid(raise_exception=True)
        max_queue = Banner.objects.filter(group_type=Banner.BannerGroupType.SECOND).order_by('-queue').first()
        banner.save(group_type=Banner.BannerGroupType.SECOND, queue=max_queue.queue + 1)
        return Response(banner.data)

    @action(methods=['GET'], detail=False, url_path='first_group')
    def get_banners_first_group(self, request):
        banners = Banner.objects.filter(group_type=Banner.BannerGroupType.FIRST).order_by('queue').all()
        serializer = self.get_serializer(instance=banners, many=True)
        return Response(serializer.data)
    
    @action(methods=['GET'], detail=False, url_path='second_group')
    def get_banners_second_group(self, request):
        banners = Banner.objects.filter(group_type=Banner.BannerGroupType.SECOND).order_by('queue').all()
        serializer = self.get_serializer(instance=banners, many=True)
        return Response(serializer.data)
    

class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = AdminCategorySerializer
    parser_classes = [MultiPartParser]
    permission_classes = [permissions.IsAdminUser]


class AdminNomenclatureCategoryViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.UpdateModelMixin, mixins.DestroyModelMixin):
    queryset = NomenclatureCategory.objects.all()
    serializer_class = NomenclatureCategorySerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = CustomPagination


class AdminNomenclaturesViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.UpdateModelMixin, mixins.RetrieveModelMixin):
    serializer_class = NomenclatureSerializer
    queryset = Nomenclature.objects.all()
    permission_classes = [permissions.IsAdminUser]
    pagination_class = CustomPagination
    filter_backends = [filters.SearchFilter, IsAssignedFilter]
    search_fields = ['title', 'code']

    @swagger_auto_schema(manual_parameters=[
        openapi.Parameter("assigned", openapi.IN_QUERY, type=openapi.TYPE_BOOLEAN, required=False, description='Привязан к категории или нет')
    ])
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(manual_parameters=[
            openapi.Parameter('level_of_nesting', openapi.IN_QUERY, description='Уровень вложенности, дефолт = 0', type=openapi.TYPE_INTEGER),
            openapi.Parameter("page_size", openapi.IN_QUERY, type=openapi.TYPE_NUMBER),
            openapi.Parameter("page", openapi.IN_QUERY, type=openapi.TYPE_NUMBER),
        ])
    @action(methods=['GET'], url_path='by_nesting', detail=False)
    def get_by_nesting(self, request):
        level_of_nesting = int(request.GET['level_of_nesting']) if 'level_of_nesting' in request.GET else 0
        nomenclatures = get_nomenclatures(level_of_nesting)
        page = self.paginate_queryset(nomenclatures)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(nomenclatures, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=CreateNomenclatureCategorySerializer(many=True),
        responses={201: CreateNomenclatureCategorySerializer(many=True)}
    )        
    @action(methods=['POST'], url_path='add_to_category', detail=False, serializer_class=CreateNomenclatureCategorySerializer)
    def add_nomenclature_to_category(self, request):
        """
        Связывает номенклатуру с категорией. В этом роуте можно добавлять сразу много номенклатур/категорий, чтобы не делать много запросов и оптимизировать все запросы к БД. Просто передаешь их через массив
        """
        serializer = self.get_serializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CompilationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    queryset = Compilation.objects.order_by('queue').all()

    def get_serializer_class(self):
        if self.action == 'create':
            return CompilationCreateSerializer
        return CompilationSerializer

    @swagger_auto_schema(responses={404: DetailSerializer, 200: CompilationSerializer}, request_body=NomenclatureRelatedSerializer)
    @action(methods=['POST'], url_path='attach_nomenclature', detail=True)
    def attach_item(self, request, pk):
        try:
            compilation = Compilation.objects.get(id=pk)
        except:
            return Response({'detail': 'Не найдено'}, status=status.HTTP_404_NOT_FOUND)
        
        nomenclatures = NomenclatureRelatedSerializer(data=request.data)
        nomenclatures.is_valid(raise_exception=True)

        nomenclature = nomenclatures.validated_data['nomenclature']

        compilation.nomenclatures.add(nomenclature)
        return Response(CompilationSerializer(instance=compilation).data)

    @swagger_auto_schema(request_body=CompilationQueueSerializer(many=True), responses={404: DetailSerializer, 200: CompilationSerializer(many=True)})
    @action(methods=['POST'], url_path='save', detail=False, serializer_class=CompilationQueueSerializer)
    def save_compilations(self, request):
        compilations = []

        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        
        for item in serializer.validated_data:
            comp = item['id']
            comp.queue = item['queue']
            comp.save()
            compilations.append(comp)

        return Response(CompilationSerializer(instance=compilations, many=True).data)

    @swagger_auto_schema(responses={404: DetailSerializer, 200: NomenclatureCompilationSerializer(many=True)})
    @action(methods=['GET'], url_path='list_nomenclatures', detail=True, serializer_class=NomenclatureCompilationSerializer)
    def get_list_nomenclatures(self, request, pk):
        try:
            compilation = Compilation.objects.get(id=pk)
        except:
            return Response({'detail': 'Не найдено'}, status=status.HTTP_404_NOT_FOUND)

        qs = Nomenclature.objects.annotate(
            status=Exists(compilation.nomenclatures.filter(id=OuterRef('pk')))
        ).order_by('-status', 'title')

        return Response(NomenclatureCompilationSerializer(instance=qs, many=True).data)


    def create(self, request, *args, **kwargs):
        compilation = self.get_serializer(data=request.data)
        compilation.is_valid(raise_exception=True)
        max_queue = Compilation.objects.order_by('-queue').first()
        if max_queue is None:
            max_queue = 0
        else:
            max_queue = max_queue.queue
        compilation.save(queue=max_queue+1)
        return Response(compilation.data)
