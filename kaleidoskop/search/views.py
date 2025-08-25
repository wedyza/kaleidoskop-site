import abc

from rest_framework.response import Response
from django.http import HttpResponse
from elasticsearch_dsl import Q
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.views import APIView
from django_elasticsearch_dsl import Document
from api.serializers import ItemSerializer
from .documents import ItemDocument

class PaginatedElasticSearchAPIView(): #Общий клаасс для поиска
    serializer_class = Document
    document_class = Document
    
    @abc.abstractmethod
    def generate_q_expression(self, query):
        """This method should be overridden
        and return a Q() expression."""

    def get_queryset(self):
        return super().get_queryset()
    

    def get(self, request, query):
        # try:
        query = self.generate_q_expression(query)

        search = self.document_class.search().query(query)
        response = search.to_queryset()

        # print(response)
        results = self.paginate_queryset(response, request)
        print(results)
        serializer = self.serializer_class(results, many=True)

        return Response(serializer.data)
        # except Exception as e:
        #     return HttpResponse(e, status=500)
        

class ItemSearchView(PaginatedElasticSearchAPIView):
    serializer_class = ItemSerializer
    document_class = ItemDocument

    def generate_q_expression(self, query):
        return Q(
            'multi_match',
            query=query,
            fields = [
                'title',
                'category'
            ],
            fuzziness = 'auto'
        )