from rest_framework import serializers

from .models import Basket


class BasketListSerializer(serializers.ModelSerializer):
    price = serializers.SerializerMethodField()
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
            "product",
            "color",
            "size",
            "created_at",
        ]

    def get_variant(self, obj):
        return obj.cloth_variant or obj.shoe_variant

    def get_price(self, obj):
        return self.get_variant(obj).price

    def get_product(self, obj):
        product = self.get_variant(obj).product
        return {"id": product.id, "name": product.name}

    def get_color(self, obj):
        return self.get_variant(obj).color.name

    def get_size(self, obj):
        return self.get_variant(obj).size