from rest_framework import serializers



from .models import Basket



class BasketListSerializer(serializers.ModelSerializer):
    class Meta:
        model=Basket
        fields=["id", "user", "quantity", "created_at"]


