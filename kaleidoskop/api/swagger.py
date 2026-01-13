# core/swagger.py
from drf_yasg.inspectors import SwaggerAutoSchema

class UrlBasedTagsSchema(SwaggerAutoSchema):
    def get_tags(self, operation_keys=None):
        # operation_keys = ['admin_panel', 'banner', 'first_group', 'list']
        operation_keys = operation_keys or self.operation_keys
        if hasattr(self.view, 'swagger_tags'):
            return self.view.swagger_tags

        # пример: берём первые два сегмента как группу
        if operation_keys[0] == 'admin_panel':
            tag = f'{operation_keys[0]}/{operation_keys[1]}'
        else:
            tag = operation_keys[0]

        return [tag]
