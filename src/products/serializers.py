


from rest_framework import serializers



from accounts.serializers import CustomUserSerializer
from .models import Product,ProductComment



class ProductListSerializer(serializers.ModelSerializer):
    product_images = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "slug", "category", "product_type", \
            "updated_at", "product_images", "price"]

    def get_price(self, obj):
        variants = obj.productclothvariant if obj.product_type == "cloth" else obj.productshoesvariant
        return variants.filter(is_available=True).values_list("price", flat=True).order_by("price").first()

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
    colors = serializers.SerializerMethodField()
    sizes = serializers.SerializerMethodField()
    variants = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "slug", "category", "product_type", "brand", \
            "description", "created_at", "updated_at", "product_images", \
            "comments", "colors", "sizes", "variants"]

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

    def get_colors(self, obj):
        return self.context.get("colors", [])

    def get_sizes(self, obj):
        return self.context.get("sizes", [])

    def get_variants(self, obj):
        return self.context.get("variants", [])

    def get_comments(self, obj):
        product_comments=self.context.get("product_comments")
        serializer=ProductCommentSerializer(product_comments, many=True)
        return serializer.data
 



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


# class ProductVariantSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = ProductVariant
#         fields = [
#             "id",
#             "product",
#             "size",
#             "color",
#             "quantity",
#             "is_available",
#         ]

#     def validate(self, attrs):
#         product = attrs["product"]
#         size = attrs["size"]

#         if product.product_type == "cloth":
#             valid_sizes = dict(ProductVariant.CLOTH_SIZE_CHOICES)
#         elif product.product_type == "shoe":
#             valid_sizes = dict(ProductVariant.SHOE_SIZE_CHOICES)
#         else:
#             valid_sizes = {}

#         if size not in valid_sizes:
#             raise serializers.ValidationError({
#                 "size": f"Invalid size '{size}' for this product."
#             })

#         return attrs