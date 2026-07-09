from django.urls import path

from rest_framework_simplejwt.views import  TokenObtainPairView, TokenRefreshView





from .views import RegisterView


urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("api/refresh-token/",  TokenRefreshView.as_view()),
    path("api/get-token/", TokenObtainPairView.as_view()),


]
