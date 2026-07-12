from django.urls import path

from .views import AddToBasketView, DeleteFromBasketView, MyBasketListView

urlpatterns = [
    path('products/<int:product_id>/add-to-basket/<int:user_id>/', AddToBasketView.as_view()),
    path('products/<int:product_id>/delete-from-basket/<int:user_id>/', DeleteFromBasketView.as_view()),
    path('mybasket-list/', MyBasketListView.as_view())

]
