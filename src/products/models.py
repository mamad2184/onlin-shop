from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

from utils.products.models import product_image_path


CustomUser=get_user_model()

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class Product(models.Model):
    PRODUCT_TYPE_CHOICES = [
        ('cloth', 'Clothe'),
        ('shoe', 'Shoe'),
    ]

    BRAND_CHOICES = [
        
    ('nike', 'Nike'),
    ('perfect', 'Perfect'),
    ]
    author=models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200)
    image= models.ImageField(upload_to=product_image_path, blank=True, null=True)
    slug = models.SlugField(max_length=220, unique=True)
    category = models.ManyToManyField(Category, related_name='products', blank=True)
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPE_CHOICES)
    brand = models.CharField(max_length=100, choices=BRAND_CHOICES, blank=True)
    description = models.TextField(blank=True)
    price = models.PositiveIntegerField(default=0)
    quantity = models.PositiveIntegerField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name}--> {self.product_type} of {self.brand}"



from django.conf import settings
from django.db import models


class ProductComment(models.Model):
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, related_name="product_comments")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user_comments")
    comment = models.TextField(max_length=512)
    # rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
     


    class Meta:
        ordering = ["-created_at"]
        # unique_together = ("product", "user")

    
    def clean(self):
        product_comments = ProductComment.objects.filter(product=self.product, user=self.user)
        if product_comments.count() >= 5:
            raise ValidationError("You have already submitted the maximum number of comments for this product.")

        
    def __str__(self):
        return f"{self.product} - {self.comment}"

    

class ProductImage(models.Model):
    image=models.ImageField(upload_to=product_image_path, blank=True, null=True)
    product=models.ForeignKey(Product, on_delete=models.CASCADE, related_name="product_images")


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    sku = models.CharField(max_length=60, unique=True)
    size = models.CharField(max_length=20, blank=True)
    color = models.CharField(max_length=50, blank=True)
    quantity = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)

    class Meta:
        ordering = ['product', 'sku']

    def __str__(self):
        return f'{self.product.name} - {self.size} - {self.color}'
