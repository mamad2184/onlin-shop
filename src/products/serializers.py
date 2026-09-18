


from rest_framework import serializers



from accounts.serializers import CustomUserSerializer
from .models import Product,ProductComment, CommentReply



class ProductListSerializer(serializers.ModelSerializer):
    product_images = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    is_available = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "slug", "category", "product_type", \
            "updated_at", "product_images", "price", "is_available"]

    def get_price(self, obj):
        variants = obj.productclothvariant if obj.product_type == "cloth" else obj.productshoesvariant
        variant = variants.filter(is_available=True).order_by("price").first()
        if not variant:
            return None
        return {
            "original_price": variant.price,
            "final_price": variant.final_price,
            "discount_percentage": obj.discount_percentage if obj.is_discount_active else 0,
        }

    def get_is_available(self, obj):
        variants = obj.productclothvariant if obj.product_type == "cloth" else obj.productshoesvariant
        return variants.filter(is_available=True, quantity__gt=0).exists()

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
    product_images = serializers.SerializerMethodField()
    colors = serializers.SerializerMethodField()
    sizes = serializers.SerializerMethodField()
    variants = serializers.SerializerMethodField()
    is_discount_active = serializers.SerializerMethodField()


    class Meta:
        model = Product
        fields = ["id", "name", "slug", "category", "product_type", "brand", \
            "description", "created_at", "updated_at", "product_images", \
            "colors", "sizes", "variants", "discount_percentage", \
            "discount_start", "discount_end", "is_discount_active"]

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

    def get_is_discount_active(self, obj):
        return obj.is_discount_active




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


class CommentReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentReply
        fields = ["id", "comment", "parent", "user", "text", "created_at"]
        read_only_fields = ["id", "user", "created_at", "comment"]

    def validate(self, attrs):
        parent = attrs.get("parent")
        comment = self.context.get("comment")

        if parent:
            # Parent reply must belong to the same comment
            if parent.comment_id != comment.id:
                raise serializers.ValidationError(
                    "Parent reply does not belong to this comment."
                )

        if not attrs.get("text"):
            raise serializers.ValidationError("Reply text is required.")

        return attrs



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