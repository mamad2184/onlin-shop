from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.db import IntegrityError


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.pagination import PageNumberPagination




from .models import Product, ProductComment, CommentReply, ProductRating
from .serializers import ProductListSerializer, ProductDetailsSerializer, ProductCommentSerializer, CommentReplySerializer,\
ProductRatingSerializer

 

class ProductListView(APIView):
    def get(self, request, product_type=None):
        search = request.query_params.get("search")
        products = Product.objects.all()

        if product_type:
            if product_type in ["cloth", "shoe"]:
                products = products.filter(product_type=product_type)

                if search:
                    products = products.filter(
                        Q(product_type__icontains=product_type) &
                        (
                            Q(name__icontains=search) |
                            Q(description__icontains=search) |
                            Q(brand__icontains=search) |
                            Q(category__name__icontains=search)
                        )
                    ).distinct()
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)

        elif search:
            products = products.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(brand__icontains=search) |
                Q(category__name__icontains=search)
            ).distinct()

        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(products, request)

        serializer = ProductListSerializer(
            page,
            many=True,
            context={"request": request}
        )

        return paginator.get_paginated_response(serializer.data)



class ProductDetailsView(APIView):

    def get(self, request, product_id):
        product_obj = get_object_or_404(Product, id=product_id)


        product_colors_available = []
        product_sizes_available = []
        product_variants_available = []

        if product_obj.product_type == "cloth":
            product_variant_available = product_obj.productclothvariant.filter(is_available=True)
        else:
            product_variant_available = product_obj.productshoesvariant.filter(is_available=True)

        for variant_obj in product_variant_available:
            color = variant_obj.color.name
            if color not in product_colors_available:
                product_colors_available.append(color)

            size = variant_obj.size
            if size not in product_sizes_available:
                product_sizes_available.append(size)

            product_variants_available.append({
                "id": variant_obj.id,
                "color": color,
                "size": size,
                "quantity": variant_obj.quantity,
                "is_available": variant_obj.is_available,
                "price": variant_obj.price,
                "final_price": variant_obj.final_price,
                "sku": variant_obj.sku,
            })

        serializer = ProductDetailsSerializer(
            product_obj,
            context={
                "request": request,
                "colors": product_colors_available,
                "sizes": product_sizes_available,
                "variants": product_variants_available,
            }
        )

        return Response(serializer.data, status=status.HTTP_200_OK)



class ProductCommentListView(APIView):

    def get(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)

        comments = product.product_comments.filter(
            is_approved=True
        )

        paginator = PageNumberPagination()

        paginated_comments = paginator.paginate_queryset(
            comments,
            request
        )

        serializer = ProductCommentSerializer(
            paginated_comments,
            many=True
        )

        return paginator.get_paginated_response(
            serializer.data
        )

class CommentReplyView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, comment_id):
        comment = get_object_or_404(ProductComment, pk=comment_id)
        replies = comment.replies.select_related("user").all()
        serializer = CommentReplySerializer(replies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, comment_id):
        try:
            comment = ProductComment.objects.get(pk=comment_id)
        except ProductComment.DoesNotExist:
            return Response(
                {"detail": "Comment not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        product = comment.product  # get the product of this comment

        # Limit: max 5 replies per user per product
        user_reply_count = CommentReply.objects.filter(
            comment__product=product,
            user=request.user
        ).count()

        if user_reply_count >= 5:
            return Response(
                {"detail": "You have reached the maximum of 5 replies for this product."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CommentReplySerializer(
            data=request.data,
            context={"comment": comment}
        )

        if serializer.is_valid():
            serializer.save(
                user=request.user,
                comment=comment
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class AddCommentView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

   
    def post(self, request, product_id):
        product= get_object_or_404(Product, id=product_id)
        user=request.user
        comment=request.data.get("comment")

        if comment:
            ProductComment.objects.filter(product=product, user=user)
            if ProductComment.objects.filter(product=product, user=user).count() >= 5:
                return Response({"message": "You have reached the maximum number of comments for this product."}, status=status.HTTP_400_BAD_REQUEST)
            ProductComment.objects.create(user=user, product=product, comment=comment)   
            return Response({"message": "Comment created successfully."}, status=status.HTTP_201_CREATED)

        return Response({"message": "please enter something."}, status=status.HTTP_400_BAD_REQUEST)



class DeleteCommentView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, comment_id):
        comment = get_object_or_404(
            ProductComment,
            id=comment_id
        )

        if comment.user != request.user:
            return Response(
                {"message": "You can only delete your own comments."},
                status=status.HTTP_403_FORBIDDEN
            )

        comment.delete()

        return Response(
            {"message": "Comment deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )
 

class RateProductView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)

        rating = ProductRating.objects.filter(
            product=product,
            user=request.user
        ).first()

        if rating:
            serializer = ProductRatingSerializer(
                rating,
                data=request.data
            )
        else:
            serializer = ProductRatingSerializer(
                data=request.data
            )

        serializer.is_valid(raise_exception=True)

        try:
            if rating:
                serializer.save()
                message = "Rating updated successfully."
            else:
                serializer.save(
                    product=product,
                    user=request.user
                )
                message = "Rating submitted successfully."

        except IntegrityError:
            return Response(
                {"detail": "Unable to save rating."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product.refresh_from_db(
            fields=[
                "average_rating",
                "ratings_count",
                "rating_breakdown",
            ]
        )

        return Response(
            {
                "detail": message,
                "rating": serializer.data,
                "average_rating": product.average_rating,
                "ratings_count": product.ratings_count,
                "rating_breakdown": product.rating_breakdown,
            },
            status=status.HTTP_200_OK,
        )


class DeleteProductRatingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)

        rating = ProductRating.objects.filter(
            product=product,
            user=request.user
        ).first()

        if not rating:
            return Response(
                {"detail": "You have not rated this product."},
                status=status.HTTP_404_NOT_FOUND,
            )

        rating.delete()

        product.refresh_from_db(
            fields=[
                "average_rating",
                "ratings_count",
                "rating_breakdown",
            ]
        )

        return Response(
            {
                "detail": "Rating deleted successfully.",
                "average_rating": product.average_rating,
                "ratings_count": product.ratings_count,
                "rating_breakdown": product.rating_breakdown,
            },
            status=status.HTTP_200_OK,
        )