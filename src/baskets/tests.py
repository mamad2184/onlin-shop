from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken

from baskets.models import Basket
from products.models import Color, Product, ProductClothVariant


class BasketVariantSelectionTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='buyer',
            email='buyer@example.com',
            password='strongpass123',
        )
        self.token = str(RefreshToken.for_user(self.user).access_token)
        self.product = Product.objects.create(
            name='Nike Runner',
            slug='nike-runner',
            product_type='cloth',
            brand='nike',
        )
        self.blue = Color.objects.create(name='Blue', slug='blue')
        ProductClothVariant.objects.create(
            product=self.product,
            size='M',
            color=self.blue,
            quantity=4,
            is_available=True,
        )

    def test_add_to_basket_records_selected_variant(self):
        response = self.client.post(
            f'/products/{self.product.id}/add-basket/',
            {'color': 'Blue', 'size': 'M', 'quantity': 2},
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.token}',
        )

        self.assertEqual(response.status_code, 200)
        variant = ProductClothVariant.objects.get(product=self.product, color=self.blue, size='M')
        basket_item = Basket.objects.get(user=self.user, cloth_variant=variant)
        self.assertEqual(basket_item.quantity, 2)
        self.assertEqual(basket_item.cloth_variant, variant)
