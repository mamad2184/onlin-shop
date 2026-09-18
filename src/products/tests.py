from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Color, CommentReply, Product, ProductClothVariant, ProductComment, ProductShoeVariant


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

    def test_duplicate_product_size_color_variant_adds_to_existing_stock(self):
        ProductClothVariant.objects.create(
            product=self.product,
            size="M",
            color=self.blue,
            quantity=5,
            is_available=True,
        )

        ProductClothVariant.objects.create(
            product=self.product,
            size="M",
            color=self.blue,
            quantity=3,
            is_available=True,
        )

        self.assertEqual(ProductClothVariant.objects.filter(product=self.product).count(), 1)
        self.assertEqual(ProductClothVariant.objects.get(product=self.product).quantity, 8)

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


class CommentReplyTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="commenter",
            password="strongpass123",
        )
        self.token = str(RefreshToken.for_user(self.user).access_token)
        self.product = Product.objects.create(
            author=self.user,
            name="Comment Product",
            slug="comment-product",
            product_type="cloth",
        )
        self.comment = ProductComment.objects.create(
            product=self.product,
            user=self.user,
            comment="A product comment",
        )

    def test_authenticated_user_can_create_root_and_nested_replies(self):
        headers = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}
        root_response = self.client.post(
            f"/comments/{self.comment.id}/replies/",
            {"text": "A root reply"},
            format="json",
            **headers,
        )

        self.assertEqual(root_response.status_code, 201)
        root_reply = CommentReply.objects.get(text="A root reply")
        nested_response = self.client.post(
            f"/comments/{self.comment.id}/replies/",
            {"text": "A nested reply", "parent": root_reply.id},
            format="json",
            **headers,
        )

        self.assertEqual(nested_response.status_code, 201)
        self.assertEqual(CommentReply.objects.get(text="A nested reply").parent_id, root_reply.id)
