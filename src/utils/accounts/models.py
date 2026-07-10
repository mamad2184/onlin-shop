


def profile_image_path(instance, file_name):
    
    return f"profiles/{instance.username}/{file_name}"
    















def product_image_path(instance, filename):
    return f"product/{instance.product.product_type}/{filename}"