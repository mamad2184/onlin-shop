from django.contrib import admin

from .models import (
    Product,
    ProductImage,
    ProductClothVariant,
    ProductShoeVariant,
    Color,
    Category,
    ProductComment,
    ProductRating,
)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductClothVariantInline(admin.TabularInline):
    model = ProductClothVariant
    extra = 1
    fields = (
        "size",
        "color",
        "price",
        "quantity",
        "is_available",
        "sku",
    )
    readonly_fields = ("sku",)


class ProductShoeVariantInline(admin.TabularInline):
    model = ProductShoeVariant
    extra = 1
    fields = (
        "size",
        "color",
        "price",
        "quantity",
        "is_available",
        "sku",
    )
    readonly_fields = ("sku",)


@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "product_type",
        "brand",
        "average_rating",
        "ratings_count",
    )
    search_fields = ("name", "slug", "brand")
    list_filter = ("product_type", "brand")
    inlines = [
        ProductImageInline,
        ProductClothVariantInline,
        ProductShoeVariantInline,
    ]


@admin.register(ProductClothVariant)
class ProductClothVariantAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "size",
        "color",
        "sku",
        "quantity",
        "is_available",
    )
    list_filter = ("size", "color", "is_available")
    search_fields = ("sku", "product__name", "color__name")


@admin.register(ProductShoeVariant)
class ProductShoeVariantAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "size",
        "color",
        "sku",
        "quantity",
        "is_available",
    )
    list_filter = ("size", "color", "is_available")
    search_fields = ("sku", "product__name", "color__name")


@admin.register(ProductRating)
class ProductRatingAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "user",
        "rating",
        "created_at",
    )
    list_filter = ("rating",)
    search_fields = (
        "product__name",
        "product__slug",
        "user__username",
    )
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


admin.site.register(Category)
admin.site.register(ProductComment)