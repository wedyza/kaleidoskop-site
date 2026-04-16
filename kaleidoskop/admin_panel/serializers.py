from rest_framework import serializers
from api.models import Banner, Category, Item, NomenclatureCategory, Nomenclature
from .models import Compilation
from django.db.models import Q
from services.nomenclature_service import NomenclatureService
from django.utils import timezone
from services.compilation_service import CompilationService

compilation_service = CompilationService()

nomenclature_service = NomenclatureService()

class SessionCodeSerializer(serializers.Serializer):
    code = serializers.CharField()


class AdminCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'
        read_only_fields = ['id']

class BannerSerializer(serializers.ModelSerializer):
    public_queue = serializers.SerializerMethodField('get_public_queue')
    class Meta:
        model = Banner
        exclude = ['group_type']
        read_only_fields = ['created_at', 'id', 'queue', 'get_public_queue']

    def get_public_queue(self, obj:Banner):
        if not obj.active:
            return 'Неактивно'
        higher = Banner.objects.filter(active=True).filter(group_type=obj.group_type).filter(queue__lt=obj.queue).count()
        return higher + 1

class BannerQueueSerializer(serializers.Serializer):
    queue = serializers.IntegerField()
    id = serializers.PrimaryKeyRelatedField(queryset=Banner.objects.all())

    def validate(self, attrs):
        return super().validate(attrs)

    def validate_queue(self, field):
        if field < 1:
            raise serializers.ValidationError
        return field
    

class NomenclatureListSerializer(serializers.ModelSerializer):
    categories = AdminCategorySerializer(many=True)

    class Meta:
        model = Nomenclature
        fields = '__all__'

class NomenclatureDetailSerializer(serializers.ModelSerializer):
    categories = AdminCategorySerializer(many=True)
    daughter = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Nomenclature
        fields = '__all__'

    def get_daughter(self, obj):
        children = obj.daughter.all()
        return NomenclatureListSerializer(children, many=True).data

class ShortenedNomenclatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nomenclature
        fields = ['id', 'title', 'code']


class CreateNomenclatureCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NomenclatureCategory
        fields = ['nomenclature', 'category']


class NomenclatureCategorySerializer(serializers.ModelSerializer):
    nomenclature = ShortenedNomenclatureSerializer()
    category = serializers.StringRelatedField()
    class Meta:
        model = NomenclatureCategory
        read_only_fields = ['id']
        fields = '__all__'


class NomenclatureCompilationSerializer(serializers.ModelSerializer):
    status = serializers.BooleanField(read_only=True)
    class Meta:
        model = Nomenclature
        fields = ['id', 'title', 'code', 'status']


class CompilationSerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField('get_item_count', read_only=True)
    public_queue = serializers.SerializerMethodField('get_public_queue', read_only=True)

    class Meta:
        model = Compilation
        fields = '__all__'
        read_only_fields = ['id', 'nomenclatures', 'created_at', 'item_count', 'public_queue']

    def get_item_count(self, obj:Compilation) -> int:
        return compilation_service.get_compilation_items_count(obj.id)
    
    def get_public_queue(self, obj:Compilation):
        if not obj.active:
            return 'Неактивно'
        today = timezone.now()
        higher = Compilation.objects.filter(active=True).filter(Q(end_time=None) | Q(end_time__lte=today)).filter(queue__lt=obj.queue).count()
        return higher + 1

class CompilationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compilation
        fields = '__all__'
        read_only_fields = ['id', 'nomenclatures', 'created_at', 'queue', 'active']


class NomenclatureRelatedSerializer(serializers.Serializer):
    nomenclature = serializers.PrimaryKeyRelatedField(queryset=Nomenclature.objects.all())

class DetailSerializer(serializers.Serializer):
    detail = serializers.BooleanField()

class CompilationQueueSerializer(serializers.Serializer):
    id = serializers.PrimaryKeyRelatedField(queryset=Compilation.objects.all())
    queue = serializers.IntegerField()
