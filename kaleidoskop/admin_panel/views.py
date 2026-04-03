from rest_framework import views, status, viewsets, permissions, mixins, filters
from drf_yasg.utils import swagger_auto_schema
from rest_framework.response import Response
from rest_framework.decorators import action
from .serializers import BannerQueueSerializer, CompilationCreateSerializer, CompilationQueueSerializer, CompilationSerializer, CreateNomenclatureCategorySerializer, DetailSerializer, NomenclatureCompilationSerializer, NomenclatureDetailSerializer, NomenclatureListSerializer, NomenclatureRelatedSerializer, SessionCodeSerializer, BannerSerializer, AdminCategorySerializer
from django.core.exceptions import ValidationError
from exceptions.exceptions import NotFoundException
from services.compilation_service import CompilationService
from api.models import Banner, Category, Nomenclature
from .models import Compilation
from drf_yasg import openapi
from .filters import IsAssignedFilter
from rest_framework.parsers import MultiPartParser
from api.paginators import CustomPagination
from services.nomenclature_service import NomenclatureService
from services.admin_service import AdminService
from rest_framework.request import Request


class LinkTelegrammView(views.APIView):
    admin_service = AdminService()
    
    @swagger_auto_schema(request_body=SessionCodeSerializer)
    def post(self, request: Request):
        code = SessionCodeSerializer(data=request.data)
        if not code.is_valid():
            raise ValidationError(code.errors)
        try:
            chat_id = self.admin_service.link_telegram(code.data['code'])
        except NotFoundException:
            return Response({'detaail': 'did not found any code'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'chat_id': chat_id}, status=status.HTTP_201_CREATED)


class BannerViewSet(viewsets.GenericViewSet, mixins.UpdateModelMixin, mixins.DestroyModelMixin):
    queryset = Banner.objects.all()
    swagger_tags = ['admin_panel/banner']
    permission_classes = (permissions.AllowAny,)
    serializer_class = BannerSerializer
    admin_service = AdminService()

    @swagger_auto_schema(request_body=BannerQueueSerializer(many=True), responses={200: BannerSerializer(many=True)})
    @action(methods=['PATCH'], detail=False, url_path='first_group/save', serializer_class=BannerQueueSerializer)
    def save_first_group(self, request):
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)        
        banners = self.admin_service.save_banner_group(serializer.validated_data, Banner.BannerGroupType.FIRST)
        return Response(BannerSerializer(instance=banners, many=True).data)


    @swagger_auto_schema(request_body=BannerQueueSerializer(many=True), responses={200: BannerSerializer(many=True)})
    @action(methods=['PATCH'], detail=False, url_path='second_group/save')
    def save_second_group(self, request):
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)        
        banners = self.admin_service.save_banner_group(serializer.validated_data, Banner.BannerGroupType.SECOND)
        return Response(BannerSerializer(instance=banners, many=True).data)


    @action(methods=['POST'], detail=False, url_path='first_group/upload', parser_classes=[MultiPartParser])
    def upload_banner_first_group(self, request):
        banner = self.get_serializer(data=request.data)
        banner.is_valid(raise_exception=True)
        banner = self.admin_service.upload_banner(banner, Banner.BannerGroupType.FIRST)
        return Response(banner.data)
    
    
    @action(methods=['POST'], detail=False, url_path='second_group/upload', parser_classes=[MultiPartParser])
    def upload_banner_second_group(self, request):
        banner = self.get_serializer(data=request.data)
        banner.is_valid(raise_exception=True)
        banner = self.admin_service.upload_banner(banner, Banner.BannerGroupType.SECOND)
        return Response(banner.data)


    @action(methods=['GET'], detail=False, url_path='first_group')
    def get_banners_first_group(self, request):
        banners = self.admin_service.get_admin_queryset(Banner.BannerGroupType.FIRST)
        serializer = self.get_serializer(instance=banners, many=True)
        return Response(serializer.data)
    
    
    @action(methods=['GET'], detail=False, url_path='second_group')
    def get_banners_second_group(self, request):
        banners = self.admin_service.get_admin_queryset(Banner.BannerGroupType.SECOND)
        serializer = self.get_serializer(instance=banners, many=True)
        return Response(serializer.data)
    

class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all() # Не буду наверное менять
    serializer_class = AdminCategorySerializer
    parser_classes = [MultiPartParser]
    permission_classes = [permissions.IsAdminUser]

class AdminNomenclaturesViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.UpdateModelMixin, mixins.RetrieveModelMixin):
    # queryset = Nomenclature.objects.all()
    permission_classes = [permissions.IsAdminUser]
    pagination_class = CustomPagination
    filter_backends = [filters.SearchFilter, IsAssignedFilter]
    search_fields = ['title', 'code']
    nomenclature_service = NomenclatureService()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return NomenclatureListSerializer
        return NomenclatureDetailSerializer
    
    def get_queryset(self):
        return Nomenclature.objects.filter(associative=False)
    
    @swagger_auto_schema(manual_parameters=[
        openapi.Parameter("assigned", openapi.IN_QUERY, type=openapi.TYPE_BOOLEAN, required=False, description='Привязан к категории или нет')
    ])
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(manual_parameters=[
            # openapi.Parameter('level_of_nesting', openapi.IN_QUERY, description='Уровень вложенности, дефолт = 0', type=openapi.TYPE_INTEGER),
            openapi.Parameter("page_size", openapi.IN_QUERY, type=openapi.TYPE_NUMBER),
            openapi.Parameter("page", openapi.IN_QUERY, type=openapi.TYPE_NUMBER),
        ])
    @action(methods=['GET'], url_path='root', detail=False)
    def get_by_nesting(self, request):
        nomenclatures = self.nomenclature_service.get_nomenclatures(0)
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
        serializer = CreateNomenclatureCategorySerializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['DELETE'], url_path='delete_from_category/(?P<category_id>[^/.]+)', detail=True)
    def delete_from_category(self, request, pk, category_id):
        """
        Удаляет связь Nomenclatures <=> Categories
        """
        try:
            self.nomenclature_service.remove_nomenclature_from_category(category_pk=category_id, nomenclature_pk=pk)
            return Response({'detail': 'success'})
        except Exception as e:
            print(e)
            return Response({'detail': 'did not found any category with that'}, status=status.HTTP_404_NOT_FOUND)

class CompilationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    queryset = Compilation.objects.order_by('queue').all()
    compilation_service = CompilationService()

    def get_serializer_class(self):
        if self.action == 'create':
            return CompilationCreateSerializer
        return CompilationSerializer

    @swagger_auto_schema(responses={404: DetailSerializer, 200: CompilationSerializer}, request_body=NomenclatureRelatedSerializer)
    @action(methods=['POST'], url_path='attach_nomenclature', detail=True)
    def attach_item(self, request, pk):
        try:
            compilation = self.compilation_service.attach_category(pk, request.data)
        except NotFoundException as e:
            print(e.args)
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(CompilationSerializer(instance=compilation).data)

    @swagger_auto_schema(request_body=CompilationQueueSerializer(many=True), responses={404: DetailSerializer, 200: CompilationSerializer(many=True)})
    @action(methods=['POST'], url_path='save', detail=False, serializer_class=CompilationQueueSerializer)
    def save_compilations(self, request):
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        compilations = self.compilation_service.save(serializer.validated_data)
        return Response(CompilationSerializer(instance=compilations, many=True).data)

    @swagger_auto_schema(responses={404: DetailSerializer, 200: NomenclatureCompilationSerializer(many=True)})
    @action(methods=['GET'], url_path='list_nomenclatures', detail=True, serializer_class=NomenclatureCompilationSerializer)
    def get_list_nomenclatures(self, request, pk):
        try: 
            qs = self.compilation_service.get_nomenclatures_queryset(pk)
            return Response(NomenclatureCompilationSerializer(instance=qs, many=True).data)
        except Exception as e:
            print(e)
            return Response({'detail': 'Не найдено'}, status=status.HTTP_404_NOT_FOUND)


    def create(self, request):
        compilation = self.get_serializer(data=request.data)
        compilation.is_valid(raise_exception=True)
        compilation = self.compilation_service.create(compilation)
        return Response(compilation.data)
