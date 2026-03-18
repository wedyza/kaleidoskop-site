# storage.py
from urllib.parse import urlparse, urlunparse
from django.conf import settings as dj
from storages.backends.s3boto3 import S3Boto3Storage

class MinioDualStorage(S3Boto3Storage):
    def __init__(self, *args, **kwargs):
        internal = (
            "http://minio:9000"
            if getattr(dj, "CONTAINER_LAUNCHER", False)
            else "http://localhost:9000" # Тут локальный адрес, обычно localhost
        )

        self.public_host = dj.SERVER_ENDPOINT      # "94.190.123.143"
        self.public_prefix = "/media"              # как в nginx

        super().__init__(
            endpoint_url=internal,
            bucket_name="local",
            querystring_auth=True,
            addressing_style="path",
            *args, **kwargs,
        )

    def url(self, name, parameters=None, expire=None, http_method=None):
        original = super().url(name, parameters=parameters, expire=expire, http_method=http_method)
        p = urlparse(original)

        # НИЧЕГО не трогаем в path и query, меняем только схему+host+префикс
        return urlunparse((
            "https",
            self.public_host,                     # 94.190.123.143
            f"{self.public_prefix}{p.path}",      # /media/local/categories/icon.png
            p.params,
            p.query,
            p.fragment,
        ))
