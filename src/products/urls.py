from django.urls import path

from .views import ProductListView, ProductDetails


urlpatterns = [
    path('products/', ProductListView.as_view() ),
    path('products/<int:product_id>/', ProductDetails.as_view() )
    
]
