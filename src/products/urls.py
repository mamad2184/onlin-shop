from django.urls import path

from .views import ProductCommentListView, ProductListView, ProductDetailsView, AddCommentView, DeleteCommentView, CommentReplyView


urlpatterns = [
    path('products/', ProductListView.as_view()),
    path('products/<int:product_id>/',ProductDetailsView.as_view() ),
    path('products/<int:product_id>/comments/',ProductCommentListView.as_view() ),
    path('products/<str:product_type>/', ProductListView.as_view()),
   
    path("products/<int:product_id>/add-comment/", AddCommentView.as_view()),
    path("comments/<int:comment_id>/replies/", CommentReplyView.as_view()),
    path("comments/<int:comment_id>/delete/", DeleteCommentView.as_view()),
]
    
