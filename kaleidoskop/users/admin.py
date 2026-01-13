from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomAbstractUser

class CustomUserAdmin(admin.ModelAdmin):
    list_display_links = ('email',)
    list_display = ('first_name', 'last_name', 'email', 'is_superuser', 'is_staff', 'sex', 'code')
    search_fields = ('first_name', 'last_name', 'email')
    list_filter = ('is_staff', 'is_superuser')
    list_editable =  ('first_name', 'last_name', 'is_superuser', 'is_staff', 'sex')

# Register your models here.
admin.site.register(CustomAbstractUser, CustomUserAdmin)