from rest_framework import pagination


class CustomPagination(pagination.PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 50
    page_query_param = "page"

    # def get_next_link(self):
    #     if not self.page.has_next():
    #         return None
    #     base_url = f"http://188.68.80.72:8000{self.request.path}"
    #     return f"{base_url}?page={self.page.next_page_number()}"
    