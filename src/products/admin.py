from django.contrib import admin

from .models import Product, ProductImage, ProductComment


admin.site.register(Product)
admin.site.register(ProductImage)




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