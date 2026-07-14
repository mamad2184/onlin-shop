from django.urls import path

from .views import AddToBasketView, DeleteFromBasketView, MyBasketListView

urlpatterns = [
    path('products/<int:product_id>/add-basket/', AddToBasketView.as_view()),
    path('products/<int:product_id>/delete-basket/', DeleteFromBasketView.as_view()),
    path('mybasket-list/', MyBasketListView.as_view())

]
