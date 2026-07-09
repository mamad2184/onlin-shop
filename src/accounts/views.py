from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
 

from rest_framework.response import  Response
from rest_framework.views import APIView



CustomUser=get_user_model()


class RegisterView(APIView):
    def post(self, request):
        username=request.data.get("username")
        password=request.data.get("password")
        print(password)

        if username and password:
            try:
                CustomUser.objects.get(password=password, username=username)
            except CustomUser.DoesNotExist:
                CustomUser.objects.create_user(
                username= username,
                password= password
                )         

                return Response({"massage":"you are one of us now"})
           
            return Response({"massage":"you already was in"})
           
        

    

