from django.conf import settings
from django.core.cache import cache
from api.enums import CacheKeyType
from exceptions.exceptions import NotFoundException
from django.db.models import QuerySet

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

def cache_queryset(cache_key: str, cache_key_type: CacheKeyType = CacheKeyType.INDEX) ->QuerySet:
    """
    Самописный кэш-декоратор. Принимает на вход cache_key, по которому берет значения из кэша, а также cache_type для нестандартных реализаций ключа
    """
    def cache_realisation(func) -> QuerySet:
        def wrapper(*args, **kwargs) -> QuerySet:
            if cache_key_type == CacheKeyType.INDEX:
                if 'pk' not in kwargs:
                    raise NotFoundException("Кэш не будет работать, так как в репозиторий не передан PK объекта!")
                local_key = (cache_key + '_%s') % kwargs['pk']
            elif cache_key_type == CacheKeyType.RAW:
                pass
            elif cache_key_type == CacheKeyType.BUILDING:
                local_key = (cache_key + '_%s') % (str(args[1]) + '-' + str(args[2]))
            qs = cache.get(local_key)
            if not qs:
                qs = func(*args, **kwargs)
                cache.set(local_key, qs, timeout=15 * 60)
            return qs
        return wrapper
    return cache_realisation
