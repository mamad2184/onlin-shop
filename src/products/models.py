
import re

from django.db import models, transaction
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

from utils.products.models import product_image_path


CustomUser = get_user_model()


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


class Product(models.Model):
    PRODUCT_TYPE_CHOICES = [
        ("cloth", "Clothe"),
        ("shoe", "Shoe"),
    ]

    BRAND_CHOICES = [
        ("nike", "Nike"),
        ("perfect", "Perfect"),
    ]

    author = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=200)
    # image = models.ImageField(
    #     upload_to=product_image_path,
    #     blank=True,
    #     null=True,
    # )
    slug = models.SlugField(max_length=220, unique=True)
    category = models.ManyToManyField(
        Category,
        related_name="products",
        blank=True,
    )
    product_type = models.CharField(
        max_length=20,
        choices=PRODUCT_TYPE_CHOICES,
    )
    brand = models.CharField(
        max_length=100,
        choices=BRAND_CHOICES,
        blank=True,
    )
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name}--> {self.product_type} of {self.brand}"


class ProductComment(models.Model):
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.CASCADE,
        related_name="product_comments",
    )
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="user_comments",
    )
    comment = models.TextField(max_length=512)
    # rating = models.PositiveSmallIntegerField(
    #     validators=[MinValueValidator(1), MaxValueValidator(5)]
    # )
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        # unique_together = ("product", "user")

    def clean(self):
        if not self.product_id or not self.user_id:
            return

        product_comments = ProductComment.objects.filter(
            product=self.product,
            user=self.user,
        )

        if product_comments.count() >= 5:
            raise ValidationError(
                "You have already submitted the maximum number "
                "of comments for this product."
            )

    def __str__(self):
        return f"{self.product} - {self.comment}"


class ProductImage(models.Model):
    image = models.ImageField(
        upload_to=product_image_path,
        blank=True,
        null=True,
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="product_images",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at", "id"]

    def __str__(self):
        return f"{self.product.name} image"


class Color(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(
        max_length=60,
        unique=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class ProductClothVariant(models.Model):

    CLOTH_SIZE_CHOICES = [
        ("XS", "XS"),
        ("S", "S"),
        ("M", "M"),
        ("L", "L"),
        ("XL", "XL"),
        ("XXL", "XXL"),
    ]

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="productclothvariant",
    )
    price = models.PositiveIntegerField(default=0)
    size = models.CharField(
        max_length=20,
        choices=CLOTH_SIZE_CHOICES,
    )
    color = models.ForeignKey(
        Color,
        on_delete=models.CASCADE,
        related_name="cloth_variants",
    )
    quantity = models.PositiveIntegerField(default=1)
    is_available = models.BooleanField(default=True)
    sku = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["product", "size", "color"],
                name="unique_cloth_variant_combo",
            )
        ]

    def generate_sku(self):
        if not self.product_id or not self.size or not self.color_id:
            return ""

        product_name = re.sub(
            r"[^a-zA-Z0-9]+",
            "-",
            self.product.name,
        ).strip("-").upper()

        color_name = str(self.color.name).strip().upper()
        size = str(self.size).strip().upper()

        base = f"{product_name}-{color_name}-{size}"

        suffix = 1
        candidate = base

        while (
            ProductClothVariant.objects
            .filter(sku=candidate)
            .exclude(pk=self.pk)
            .exists()
        ):
            suffix += 1
            candidate = f"{base}-{suffix}"

        return candidate

    def clean(self):
        if not self.product_id:
            return

        if not self.size:
            raise ValidationError(
                {"size": "Size is required."}
            )

        if not self.color_id:
            raise ValidationError(
                {"color": "Color is required."}
            )

        # Do NOT reject duplicate variants here.
        # A duplicate means that stock should be added
        # to the existing variant.

        if not self.sku:
            self.sku = self.generate_sku()

    def save(self, *args, **kwargs):
        self.clean()

        # New variant:
        # create it normally.
        if not self.pk:
            with transaction.atomic():
                existing_variant = (
                    ProductClothVariant.objects
                    .select_for_update()
                    .filter(
                        product=self.product,
                        size=self.size,
                        color=self.color,
                    )
                    .first()
                )

                if existing_variant:
                    # Same Product + Size + Color:
                    # add the entered quantity to existing stock.
                    existing_variant.quantity += self.quantity
                    existing_variant.save(
                        update_fields=["quantity", "updated_at"]
                    )

                    # Use the existing database object as this
                    # variant's identity.
                    self.pk = existing_variant.pk
                    self.sku = existing_variant.sku
                    self.quantity = existing_variant.quantity

                    return

        if not self.sku:
            self.sku = self.generate_sku()

        if not self.sku:
            raise ValidationError(
                "SKU could not be generated for this variant."
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} - {self.size} - {self.color.name}"


class ProductShoeVariant(models.Model):

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

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="productshoesvariant",
    )
    price = models.PositiveIntegerField(default=0)
    size = models.CharField(
        max_length=20,
        choices=SHOE_SIZE_CHOICES,
    )
    color = models.ForeignKey(
        Color,
        on_delete=models.CASCADE,
        related_name="shoe_variants",
    )
    quantity = models.PositiveIntegerField(default=1)
    is_available = models.BooleanField(default=True)
    sku = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["product", "size", "color"],
                name="unique_shoe_variant_combo",
            )
        ]

    def generate_sku(self):
        if not self.product_id or not self.size or not self.color_id:
            return ""

        product_name = re.sub(
            r"[^a-zA-Z0-9]+",
            "-",
            self.product.name,
        ).strip("-").upper()

        color_name = str(self.color.name).strip().upper()
        size = str(self.size).strip().upper()

        base = f"{product_name}-{color_name}-{size}"

        suffix = 1
        candidate = base

        while (
            ProductShoeVariant.objects
            .filter(sku=candidate)
            .exclude(pk=self.pk)
            .exists()
        ):
            suffix += 1
            candidate = f"{base}-{suffix}"

        return candidate

    def clean(self):
        if not self.product_id:
            return

        if not self.size:
            raise ValidationError(
                {"size": "Size is required."}
            )

        if not self.color_id:
            raise ValidationError(
                {"color": "Color is required."}
            )

        # Do NOT reject duplicate variants here.
        # A duplicate means that stock should be added
        # to the existing variant.

        if not self.sku:
            self.sku = self.generate_sku()

    def save(self, *args, **kwargs):
        self.clean()

        # New variant:
        # create it normally.
        if not self.pk:
            with transaction.atomic():
                existing_variant = (
                    ProductShoeVariant.objects
                    .select_for_update()
                    .filter(
                        product=self.product,
                        size=self.size,
                        color=self.color,
                    )
                    .first()
                )

                if existing_variant:
                    # Same Product + Size + Color:
                    # add the entered quantity to existing stock.
                    existing_variant.quantity += self.quantity
                    existing_variant.save(
                        update_fields=["quantity", "updated_at"]
                    )

                    # Use the existing database object as this
                    # variant's identity.
                    self.pk = existing_variant.pk
                    self.sku = existing_variant.sku
                    self.quantity = existing_variant.quantity

                    return

        if not self.sku:
            self.sku = self.generate_sku()

        if not self.sku:
            raise ValidationError(
                "SKU could not be generated for this variant."
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} - {self.size} - {self.color.name}"

