from django.urls import path

from rest_framework_simplejwt.views import  TokenObtainPairView, TokenRefreshView





from .views import register


urlpatterns = [
    path("register/", register),
    path("api/refresh-token/",  TokenRefreshView.as_view()),
    path("apiget-token/", TokenObtainPairView.as_view()),


]
