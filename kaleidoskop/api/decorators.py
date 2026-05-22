from django.conf import settings
from django.core.cache import cache
from api.enums import CacheKeyType
from exceptions.exceptions import NotFoundException
from django.dispatch import receiver
from django.db.models import QuerySet
from django.db.models.signals import post_save, post_delete
from functools import wraps
import hashlib

def multitasker(f):
    """
    Декоратор, который управляет запуском тасков
    Если settings.CONTAINER_LAUNCHER = True (запущено в контейнере), то запускает их в Celery Worker,
    Иначе как обычную функцию
    """
    def wrapper(*args, **kwargs):
        if settings.CONTAINER_LAUNCHER:
            return f.delay(*args, **kwargs)
        return f(*args, **kwargs)
    return wrapper

def cache_queryset(cache_key: str = "", cache_key_type: CacheKeyType = CacheKeyType.INDEX, 
                   TTL: int = 15 * 60, model: type = None):
    """
    Самописный кэш-декоратор. Принимает на вход cache_key, по которому берет значения из кэша,
    а также cache_type для нестандартных реализаций ключа.
    Если передан model, то кэш будет автоматически инвалидироваться при изменении модели.
    """
    
    def cache_realisation(func):
        # Словарь для хранения ключей кэша, связанных с моделью
        cache_keys_store = {}
        
        @wraps(func)
        def wrapper(*args, **kwargs) -> QuerySet:
            if settings.USE_CACHE:
                if cache_key_type == CacheKeyType.INDEX:
                    if 'pk' not in kwargs:
                        raise NotFoundException("Кэш не будет работать, так как в репозиторий не передан PK (primary key) объекта!")
                    local_key = (cache_key + '_%s') % kwargs['pk']
                elif cache_key_type == CacheKeyType.RAW:
                    local_key = func.__name__
                elif cache_key_type == CacheKeyType.BUILDING:
                    local_key = (cache_key + '_%s') % (str(args[1]) + '-' + str(args[2]))
                
                if model and local_key not in cache_keys_store.get(model, set()):
                    if model not in cache_keys_store:
                        cache_keys_store[model] = set()
                    cache_keys_store[model].add(local_key)
                
                qs = cache.get(local_key)
                if not qs:
                    qs = func(*args, **kwargs)
                    cache.set(local_key, qs, timeout=TTL)
                return qs
            return func(*args, **kwargs)
        
        if model:
            @receiver([post_save, post_delete], sender=model)
            def invalidate_cache(sender, instance, **kwargs):
                """Инциалидирует кэш при изменении/удалении объекта модели"""
                if model in cache_keys_store:
                    for cache_key_to_delete in cache_keys_store[model]:
                        cache.delete(cache_key_to_delete)
                    del cache_keys_store[model]
        
        return wrapper
    return cache_realisation
