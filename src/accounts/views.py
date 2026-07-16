from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
 

from rest_framework.response import Response
from rest_framework.views import APIView


CustomUser = get_user_model()


class RegisterView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"message": "Username and password are required."},
                status=400,
            )

        if CustomUser.objects.filter(username=username).exists():
            return Response(
                {"message": "A user with that username already exists."},
                status=400,
            )

        CustomUser.objects.create_user(username=username, password=password)
        return Response(
            {"message": "Registration successful. Please log in."},
            status=201,
        )
           
        

    

