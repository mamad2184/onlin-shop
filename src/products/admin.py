from django.contrib import admin

from .models import Product, ProductImage, ProductClothVariant, ProductShoeVariant, Color,\
Category, ProductComment



class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductClothVariantInline(admin.TabularInline):
    model = ProductClothVariant
    extra = 1
    fields = ("size", "color", "quantity", "is_available", "sku")
    readonly_fields = ("sku",)


class ProductShoeVariantInline(admin.TabularInline):
    model = ProductShoeVariant
    extra = 1
    fields = ("size", "color", "quantity", "is_available", "sku")
    readonly_fields = ("sku",)


@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "product_type", "brand", "quantity")
    search_fields = ("name", "slug", "brand")
    list_filter = ("product_type", "brand")
    inlines = [ProductImageInline, ProductClothVariantInline, ProductShoeVariantInline]


@admin.register(ProductClothVariant)
class ProductClothVariantAdmin(admin.ModelAdmin):
    list_display = ("product", "size", "color", "sku", "quantity", "is_available")
    list_filter = ("size", "color", "is_available")
    search_fields = ("sku", "product__name", "color__name")


@admin.register(ProductShoeVariant)
class ProductShoeVariantAdmin(admin.ModelAdmin):
    list_display = ("product", "size", "color", "sku", "quantity", "is_available")
    list_filter = ("size", "color", "is_available")
    search_fields = ("sku", "product__name", "color__name")
 



admin.site.register(Category)
admin.site.register(ProductComment)