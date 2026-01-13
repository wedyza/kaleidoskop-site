from django.contrib import admin
from .models import Item, Category, CartItem, Order, Comment, Warehouse, Remains, Like, Cart, Nomenclature, NomenclatureCategory


class RemainsInline(admin.TabularInline):
    model = Remains
    extra = 1

class NomenclaturesInline(admin.TabularInline):
    model = NomenclatureCategory
    extra = 1
class ItemAdmin(admin.ModelAdmin):
    inlines = (RemainsInline,)

    list_display_links = ('title', )
    list_display = ('title', 'code', 'article', 'nomenclature')
    search_fields = ('title', 'code', 'article', 'nomenclature__title')
    # list_filter = ('nomenclature', )
    # autocomplete_fields = ('nomenclature', )


class RemainsAdmin(admin.ModelAdmin):
    list_display = ('item', 'warehouse', 'count')
    search_fields = ('item__title',)
    list_filter = ('warehouse',)

class CategoryAdmin(admin.ModelAdmin):
    inlines = (NomenclaturesInline,)
    list_display = ('title', )

# Register your models here.
admin.site.register(Item, ItemAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order)
admin.site.register(Comment)
admin.site.register(Warehouse)
admin.site.register(Remains, RemainsAdmin)
admin.site.register(Like)
admin.site.register(Nomenclature)
admin.site.register(NomenclatureCategory)