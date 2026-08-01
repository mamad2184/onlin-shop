

from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404




from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated




from products.models import Product

from .models import Basket
from .serializers import BasketListSerializer

CustomUser= get_user_model()


class AddToBasketView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        user = request.user

        try:
            old_basket = Basket.objects.get(product=product, user=user)
            old_basket.quantity += 1
            old_basket.save()
            return Response(
                {"message": f"{product.name} quantity updated in your basket. Now {old_basket.quantity}."},
                status=status.HTTP_200_OK,
            )
        except Basket.DoesNotExist:
            new_basket = Basket.objects.create(product=product, user=user, quantity=1)
            return Response(
                {"message": f"{product.name} added to your basket. Now {new_basket.quantity}."},
                status=status.HTTP_200_OK,
            )

        



class DeleteFromBasketView(APIView):
    # permission_classes = [IsAuthenticated]
    def post(self, request,  product_id):
        product= get_object_or_404(Product, id= product_id)
        user=  request.user

        if request.user.is_authenticated:
            try:
                old_basket= Basket.objects.get(product=product, user=user)
                old_basket.quantity -= 1
                old_basket.save()
                
                if old_basket.quantity <= 0:
                    old_basket.delete()
                    return Response({"message": f"you deleted all of {old_basket.product.name}. -->now {old_basket.quantity}"}, status=status.HTTP_200_OK)
                
                return Response({"message":f"deleted successfuly, now you have {old_basket.quantity}"})
            except Basket.DoesNotExist:
                return Response({"message": "you already don`t have this"}, status=status.HTTP_400_BAD_REQUEST)
                
        return Response({"message":"you are not authenticated"})




class MyBasketListView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            basket_list=Basket.objects.filter(user=request.user)
            print(basket_list)

            serializer= BasketListSerializer(basket_list, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({"message":"you are not authenticated"}, status=status.HTTP_400_BAD_REQUEST)
        