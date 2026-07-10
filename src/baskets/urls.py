from django.urls import path


urlpatterns = [
    path('products/<int:product_id>/add-to-basket/<int:user_id/')
]
