from django.contrib import admin

from .models import Basket 

@admin.register(Basket)
class BasketAdmin(admin.ModelAdmin):
    list_display = ('id', 'user','created_at', 'updated_at')
    list_filter = ('created_at',)
    search_fields = ('user__username',)


# @admin.register(BasketItem)
# class BasketItemAdmin(admin.ModelAdmin):
#     list_display = ('id', 'basket', 'product', 'variant', 'quantity', 'added_at')
#     search_fields = ('product__name', 'basket__user__username')
