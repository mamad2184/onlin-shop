from django.conf import settings
from django.db import models

from products.models import Product, ProductVariant

CustomUser= settings.AUTH_USER_MODEL


class Basket(models.Model):
    user = models.ForeignKey(CustomUser, related_name='baskets', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='baskets', on_delete=models.CASCADE)
    quantity= models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # name = models.CharField(max_length=150, blank=True, help_text='Optional name for a saved basket')

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Basket'
        verbose_name_plural = 'Baskets'

    def __str__(self):
        return f'product{self.product.product_type} for {self.user.username}'

    def item_count(self):
        return self.items.aggregate(total=models.Sum('quantity'))['total'] or 0

    def total_price(self):
        return sum(item.total_price() for item in self.items.all())


# class BasketItem(models.Model):
#     basket = models.ForeignKey(Basket, related_name='items', on_delete=models.CASCADE)
#     product = models.ForeignKey(Product, related_name='basket_items', on_delete=models.CASCADE)
#     variant = models.ForeignKey(ProductVariant, related_name='basket_items', blank=True, null=True, on_delete=models.SET_NULL)
#     quantity = models.PositiveIntegerField(default=1)
#     added_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         unique_together = ('basket', 'product', 'variant')
#         ordering = ['-added_at']

#     def __str__(self):
#         return f'{self.quantity} x {self.product.name} in {self.basket}'

#     @property
#     def unit_price(self):
#         return self.product.price

#     @property
#     def total_price(self):
#         return self.unit_price * self.quantity
