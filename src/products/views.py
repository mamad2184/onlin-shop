from django.shortcuts import get_object_or_404
from django.db.models import Q


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status



from .models import Product
from .serializers import ProductListSerializer, ProductDetailsSerializer




class ProductListView(APIView):
    def get(self, request):
        search= request.query_params.get("search")
        products=Product.objects.all()
        if search:
            products=Product.objects.filter(Q(name__icontains=search) | Q(description__icontains=search) | Q(brand__icontains=search) | Q(category__name__icontains=search)).distinct()
        
        serializer=ProductListSerializer(products, many=True, context={"request":request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    



class ProductDetails(APIView):
    def get(self, request, product_id):
        product_obj= get_object_or_404(Product, id= product_id)
        serializer= ProductDetailsSerializer(product_obj)
        
        return Response(serializer.data,  status=status.HTTP_200_OK)

