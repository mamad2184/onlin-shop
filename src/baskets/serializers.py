from rest_framework import serializers

from .models import Basket


class BasketListSerializer(serializers.ModelSerializer):
    price = serializers.SerializerMethodField()
    original_price = serializers.SerializerMethodField()
    discount_percentage = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    product = serializers.SerializerMethodField()
    color = serializers.SerializerMethodField()
    size = serializers.SerializerMethodField()

    class Meta:
        model = Basket
        fields = [
            "id",
            "user",
            "cloth_variant",
            "shoe_variant",
            "quantity",
            "price",
            "original_price",
            "discount_percentage",
            "total_price",
            "product",
            "color",
            "size",
            "created_at",
        ]

    def get_variant(self, obj):
        return obj.cloth_variant or obj.shoe_variant

    def get_price(self, obj):
        return self.get_variant(obj).final_price

    def get_original_price(self, obj):
        return self.get_variant(obj).price

    def get_discount_percentage(self, obj):
        product = self.get_variant(obj).product
        return product.discount_percentage if product.is_discount_active else 0

    def get_total_price(self, obj):
        return self.get_price(obj) * obj.quantity

    def get_product(self, obj):
        product = self.get_variant(obj).product
        return {"id": product.id, "name": product.name}

    def get_color(self, obj):
        return self.get_variant(obj).color.name

    def get_size(self, obj):
        return self.get_variant(obj).size