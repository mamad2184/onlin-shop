from django.conf import settings
from django.db import models

from products.models import Product, ProductClothVariant, ProductShoeVariant
from django.core.exceptions import ValidationError

CustomUser= settings.AUTH_USER_MODEL


class Basket(models.Model):
    user = models.ForeignKey(CustomUser, related_name='baskets', on_delete=models.CASCADE)
    cloth_variant = models.ForeignKey(
    ProductClothVariant,
    null=True,
    blank=True,
    on_delete=models.CASCADE
    )

    shoe_variant = models.ForeignKey(
    ProductShoeVariant,
    null=True,
    blank=True,
    on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # name = models.CharField(max_length=150, blank=True, help_text='Optional name for a saved basket')

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Basket'
        verbose_name_plural = 'Baskets'
        constraints = [
        models.UniqueConstraint(
            fields=['user', 'cloth_variant'],
            name='unique_user_cloth_variant'
        ),
        models.UniqueConstraint(
            fields=['user', 'shoe_variant'],
            name='unique_user_shoe_variant'
        ),
        ]

    def clean(self):
        if bool(self.cloth_variant_id) == bool(self.shoe_variant_id):
            raise ValidationError(
                "Basket must contain exactly one variant."
        )
        

    def __str__(self):
        variant = self.cloth_variant or self.shoe_variant
        return f'{variant.product.name} - {variant.sku} for {self.user.username}'
 


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
