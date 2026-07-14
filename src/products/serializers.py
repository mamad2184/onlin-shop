


from rest_framework import serializers


from .models import Product

class ProductListSerializer(serializers.ModelSerializer):
    
    class Meta:
        image=serializers.SerializerMethodField()
        model=Product
        fields=["id", "name", "slug", "category", "product_type",\
            "price", "updated_at", "image"]
        

        def get_image(self, obj):
            request=self.context.get("request")
            if obj.image:
                return request.build_absolute_uri(obj.image.url)
            return None

        



class ProductDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model=Product
        fields=["id", "name", "slug", "category", "product_type", "brand",\
            "description", "price", "quantity", "created_at", "updated_at"]