


from rest_framework import serializers



from accounts.serializers import CustomUserSerializer
from .models import Product



class ProductListSerializer(serializers.ModelSerializer):
    product_images = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "slug", "category", "product_type", \
            "price", "updated_at", "product_images"]

    def get_product_images(self, obj):
        product_images = list(
            obj.product_images.filter(image__isnull=False).exclude(image="")
            .order_by("created_at", "id")
        )

        image_urls = []
        for image in product_images:
            if image and getattr(image, "image", None) and getattr(image.image, "url", None):
                url = image.image.url
                if url:
                    image_urls.append(url)
        return image_urls
        

        



class ProductDetailsSerializer(serializers.ModelSerializer):
    comments = serializers.SerializerMethodField()
    product_images = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "slug", "category", "product_type", "brand", \
            "description", "price", "quantity", "created_at", "updated_at", "product_images", \
            "comments"]

    def get_product_images(self, obj):
        product_images = list(
            obj.product_images.filter(image__isnull=False).exclude(image="")
            .order_by("created_at", "id")
        )

        image_urls = []
        for image in product_images:
            if image and getattr(image, "image", None) and getattr(image.image, "url", None):
                url = image.image.url
                if url:
                    image_urls.append(url)
        return image_urls


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