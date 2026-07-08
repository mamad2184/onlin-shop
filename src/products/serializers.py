


from rest_framework import serializers


from .models import Product

class ProductListSerializer(serializers.ModelSerializer):
    class Meta:
        model=Product
        fields=["name", "slug", "category", "product_type", "brand",\
            "description", "price", "quantity", "created_at", "updated_at"]