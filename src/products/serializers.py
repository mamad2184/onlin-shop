


from rest_framework import serializers



from accounts.serializers import CustomUserSerializer
from .models import Product



class ProductListSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "slug", "category", "product_type", \
            "price", "updated_at", "image"]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and request is not None:
            return request.build_absolute_uri(obj.image.url)
        if obj.image:
            return obj.image.url
        return None

        



class ProductDetailsSerializer(serializers.ModelSerializer):
    comments = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "slug", "category", "product_type", "brand", \
            "description", "price", "quantity", "created_at", "updated_at", "image", \
            "comments"]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and request is not None:
            return request.build_absolute_uri(obj.image.url)
        if obj.image:
            return obj.image.url
        return None


    def get_comments(self, obj):
        product_comments=self.context.get("product_comments")
        serializer=ProductCommentSerializer(product_comments, many=True)
        return serializer.data

from rest_framework import serializers
from .models import ProductComment


class ProductCommentSerializer(serializers.ModelSerializer):
    user=CustomUserSerializer()
    class Meta:
        model = ProductComment
        fields = ["id", "comment", "user", "product", "is_approved", "created_at", "updated_at"]
        read_only_fields = (
            "user",
            "product",
            "is_approved",
            "created_at",
            "updated_at",
        )