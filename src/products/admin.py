from django.contrib import admin

from .models import Product, ProductImage, ProductComment


 
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 3
    # fields = ("image", "created_at", "updated_at")
    # readonly_fields = ("created_at", "updated_at")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    # list_display = ("id", "product", "image", "created_at", "updated_at")
    list_filter = ("created_at", "updated_at")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("created_at", "id")

@admin.register(ProductComment)
class ProductCommentAdmin(admin.ModelAdmin):
    # list_display = (
    #     "product",
    #     "user",
    #     "is_approved",
    #     "created_at",
    # )

    list_filter = (
        "is_approved",
    )
