


def product_image_path(instance, filename):
    product_type = getattr(instance.product, "product_type", "product")
    return f"product/{product_type}/{filename}"