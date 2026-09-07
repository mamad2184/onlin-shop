

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404




from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q




from products.models import Product

from .models import Basket
from .serializers import BasketListSerializer

CustomUser= get_user_model()

class AddToBasketView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        user = request.user

        selected_color = request.data.get("color") or request.data.get("selected_color")
        selected_size = request.data.get("size") or request.data.get("selected_size")

        try:
            quantity = int(request.data.get("quantity", 1) or 1)
        except (TypeError, ValueError):
            return Response(
                {"message": "Quantity must be a valid number."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not selected_color or not selected_size:
            return Response(
                {"message": "Please choose a color and size."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity <= 0:
            return Response(
                {"message": "Quantity must be greater than zero."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if product.product_type == "cloth":
            variant = product.productclothvariant.filter(
                color__name=selected_color,
                size=selected_size,
                is_available=True,
            ).first()

            variant_field = {"cloth_variant": variant}

        else:
            variant = product.productshoesvariant.filter(
                color__name=selected_color,
                size=selected_size,
                is_available=True,
            ).first()

            variant_field = {"shoe_variant": variant}

        if not variant:
            return Response(
                {"message": "This color and size is not available for this product."},
                status=status.HTTP_400_BAD_REQUEST
            )

        basket_item, created = Basket.objects.get_or_create(
            user=user,
            **variant_field,
            defaults={"quantity": 0},
        )

        new_quantity = basket_item.quantity + quantity

        if new_quantity > variant.quantity:
            return Response(
                {"message": "Not enough stock available."},
                status=status.HTTP_400_BAD_REQUEST
            )

        basket_item.quantity = new_quantity
        basket_item.save()

        return Response(
            {
                "message": f"{product.name} ({selected_color} / {selected_size}) added to your basket.",
                "color": selected_color,
                "size": selected_size,
                "quantity": basket_item.quantity,
            },
            status=status.HTTP_200_OK
        )


    
class DeleteFromBasketView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        user = request.user

        selected_color = request.data.get("color") or request.data.get("selected_color")
        selected_size = request.data.get("size") or request.data.get("selected_size")

        if not selected_color or not selected_size:
            return Response(
                {"message": "You must choose a color and size to remove from basket."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if product.product_type == "cloth":
            variant = product.productclothvariant.filter(
                color__name=selected_color,
                size=selected_size,
            ).first()

            variant_field = {"cloth_variant": variant}

        else:
            variant = product.productshoesvariant.filter(
                color__name=selected_color,
                size=selected_size,
            ).first()

            variant_field = {"shoe_variant": variant}

        if not variant:
            return Response(
                {"message": "This product variant does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            basket_item = Basket.objects.get(
                user=user,
                **variant_field,
            )
        except Basket.DoesNotExist:
            return Response(
                {"message": "You do not have this product variant in your basket."},
                status=status.HTTP_400_BAD_REQUEST
            )

        basket_item.quantity -= 1

        if basket_item.quantity <= 0:
            basket_item.delete()

            return Response(
                {
                    "message": f"You removed all of {product.name} "
                               f"({selected_color} / {selected_size})."
                },
                status=status.HTTP_200_OK
            )

        basket_item.save()

        return Response(
            {
                "message": f"Removed one {product.name} "
                           f"({selected_color} / {selected_size}).",
                "color": selected_color,
                "size": selected_size,
                "quantity": basket_item.quantity,
            },
            status=status.HTTP_200_OK
        )



class MyBasketListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        basket_list = Basket.objects.filter(user=request.user).filter(
            Q(cloth_variant__isnull=False) | Q(shoe_variant__isnull=False)
        )
        serializer = BasketListSerializer(basket_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        