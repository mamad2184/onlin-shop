from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import ProductRating, Product
from django.db.models import Avg, Count


def calculate_product_rating(product: Product):
    stats = product.ratings.aggregate(
        average=Avg("rating"),
        count=Count("id"),
    )

    breakdown = {
        str(i): product.ratings.filter(rating=i).count()
        for i in range(1, 6)
    }

    product.average_rating = (
        round(stats["average"], 2)
        if stats["average"] is not None
        else 0
    )

    product.ratings_count = stats["count"]

    product.rating_breakdown = breakdown

    product.save(
        update_fields=[
            "average_rating",
            "ratings_count",
            "rating_breakdown",
        ]
    )

@receiver(post_save, sender=ProductRating)
def update_rating_on_save(sender, instance, **kwargs):
    calculate_product_rating(instance.product)


@receiver(post_delete, sender=ProductRating)
def update_rating_on_delete(sender, instance, **kwargs):
    calculate_product_rating(instance.product)
