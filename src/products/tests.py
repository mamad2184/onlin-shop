from django.contrib.auth import get_user_model
from django.test import TestCase

from .models import Color, Product, ProductClothVariant, ProductShoeVariant


class VariantSkuGenerationTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="seller",
            email="seller@example.com",
            password="strongpass123",
        )
        self.product = Product.objects.create(
            author=self.user,
            name="Nike Runner",
            slug="nike-runner",
            product_type="shoe",
            brand="nike",
            quantity=10,
        )
        self.blue = Color.objects.create(name="Blue", slug="blue")
        self.red = Color.objects.create(name="Red", slug="red")

    def test_cloth_variant_sku_is_generated_from_name_size_and_color(self):
        variant = ProductClothVariant(
            product=self.product,
            size="M",
            color=self.blue,
            quantity=5,
            is_available=True,
            sku="",
        )

        variant.save()

        self.assertEqual(variant.sku, "NIKE-RUNNER-BLUE-M")

    def test_duplicate_product_size_color_variant_is_rejected(self):
        ProductClothVariant.objects.create(
            product=self.product,
            size="M",
            color=self.blue,
            quantity=5,
            is_available=True,
        )

        with self.assertRaises(Exception):
            ProductClothVariant.objects.create(
                product=self.product,
                size="M",
                color=self.blue,
                quantity=3,
                is_available=True,
            )

    def test_shoe_variant_sku_is_generated_from_name_size_and_color(self):
        variant = ProductShoeVariant(
            product=self.product,
            size="42",
            color=self.red,
            quantity=2,
            is_available=True,
            sku="",
        )

        variant.save()

        self.assertEqual(variant.sku, "NIKE-RUNNER-RED-42")
