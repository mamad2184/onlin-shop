import re

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
    # image= models.ImageField(upload_to=product_image_path, blank=True, null=True)
    slug = models.SlugField(max_length=220, unique=True)
    category = models.ManyToManyField(Category, related_name='products', blank=True)
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPE_CHOICES)
    brand = models.CharField(max_length=100, choices=BRAND_CHOICES, blank=True)
    description = models.TextField(blank=True)
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
    image = models.ImageField(upload_to=product_image_path, blank=True, null=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="product_images")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at", "id"]

    def __str__(self):
        return f"{self.product.name} image"


class Color(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class ProductClothVariant(models.Model):

    # Sizes available for clothing products
    CLOTH_SIZE_CHOICES = [
        ("XS", "XS"),
        ("S", "S"),
        ("M", "M"),
        ("L", "L"),
        ("XL", "XL"),
        ("XXL", "XXL"),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="productclothvariant")
    price = models.PositiveIntegerField(default=0)
    size = models.CharField(max_length=20, choices=CLOTH_SIZE_CHOICES)
    color = models.ForeignKey(Color, on_delete=models.CASCADE, related_name="cloth_variants")
    quantity = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)
    sku = models.CharField(max_length=100, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["product", "size", "color"], name="unique_cloth_variant_combo")
        ]

    def generate_sku(self):
        if not self.product_id or not self.size or not self.color_id:
            return ""

        product_name = re.sub(r"[^a-zA-Z0-9]+", "-", self.product.name).strip("-").upper()
        color_name = str(self.color.name).strip().upper()
        size = str(self.size).strip().upper()
        base = f"{product_name}-{color_name}-{size}"

        suffix = 1
        candidate = base
        while ProductClothVariant.objects.filter(sku=candidate).exclude(pk=self.pk).exists():
            suffix += 1
            candidate = f"{base}-{suffix}"

        return candidate

    def clean(self):
        if not self.size:
            raise ValidationError({"size": "Size is required."})
        if not self.color_id:
            raise ValidationError({"color": "Color is required."})

        if (
            ProductClothVariant.objects.filter(product=self.product, size=self.size, color=self.color)
            .exclude(pk=self.pk)
            .exists()
        ):
            raise ValidationError("This product size and color combination already exists.")

        self.sku = self.generate_sku() or self.sku

    def save(self, *args, **kwargs):
        self.clean()
        if not self.sku:
            self.sku = self.generate_sku()
        if not self.sku:
            raise ValidationError("SKU could not be generated for this variant.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} - {self.size} - {self.color.name}"


class ProductShoeVariant(models.Model):
    # Sizes available for shoe products
    SHOE_SIZE_CHOICES = [
        ("36", "36"),
        ("37", "37"),
        ("38", "38"),
        ("39", "39"),
        ("40", "40"),
        ("41", "41"),
        ("42", "42"),
        ("43", "43"),
        ("44", "44"),
        ("45", "45"),
        ("46", "46"),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="productshoesvariant")
    price = models.PositiveIntegerField(default=0)
    size = models.CharField(max_length=20, choices=SHOE_SIZE_CHOICES)
    color = models.ForeignKey(Color, on_delete=models.CASCADE, related_name="shoe_variants")
    quantity = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)
    sku = models.CharField(max_length=100, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["product", "size", "color"], name="unique_shoe_variant_combo")
        ]

    def generate_sku(self):
        if not self.product_id or not self.size or not self.color_id:
            return ""

        product_name = re.sub(r"[^a-zA-Z0-9]+", "-", self.product.name).strip("-").upper()
        color_name = str(self.color.name).strip().upper()
        size = str(self.size).strip().upper()
        base = f"{product_name}-{color_name}-{size}"

        suffix = 1
        candidate = base
        while ProductShoeVariant.objects.filter(sku=candidate).exclude(pk=self.pk).exists():
            suffix += 1
            candidate = f"{base}-{suffix}"

        return candidate

    def clean(self):
        if not self.size:
            raise ValidationError({"size": "Size is required."})
        if not self.color_id:
            raise ValidationError({"color": "Color is required."})

        if (
            ProductShoeVariant.objects.filter(product=self.product, size=self.size, color=self.color)
            .exclude(pk=self.pk)
            .exists()
        ):
            raise ValidationError("This product size and color combination already exists.")

        self.sku = self.generate_sku() or self.sku

    def save(self, *args, **kwargs):
        self.clean()
        if not self.sku:
            self.sku = self.generate_sku()
        if not self.sku:
            raise ValidationError("SKU could not be generated for this variant.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} - {self.size} - {self.color.name}"
