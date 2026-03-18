from django.db.models import Func, Lookup
from django.db.models.fields import Field


class Unaccent(Func):
    function = 'unaccent'
    template = '%(function)s(%(expressions)s)'
    arity = 1

    def __init__(self, expression, **extra):
        super().__init__(expression, **extra)

@Field.register_lookup
class TrigramPrefixLookup(Lookup):
    lookup_name = 'trigram_prefix'

    def as_sql(self, compiler, connection):
        lhs, lhs_params = self.process_lhs(compiler, connection)
        rhs, rhs_params = self.process_rhs(compiler, connection)
        sql = f"lower({lhs}) <% lower(%s)"
        params = lhs_params + rhs_params
        return sql, params