from rest_framework.serializers import ModelSerializer
from django.contrib.auth import get_user_model



CustomUser= get_user_model()


from rest_framework import serializers


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "phone",
            # "address",
        ]