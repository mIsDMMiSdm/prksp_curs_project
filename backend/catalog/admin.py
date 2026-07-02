from django.contrib import admin

from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "sku", "quantity", "price", "updated_at")
    list_filter = ("updated_at",)
    search_fields = ("name", "sku")
