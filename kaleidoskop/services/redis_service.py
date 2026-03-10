from django.conf import settings
import redis

class RedisService:
    def initialize() -> redis.StrictRedis:
        r = redis.StrictRedis(
            host=settings.REDIS_HOST,
            port=6379,
            decode_responses=True
        )
        return r