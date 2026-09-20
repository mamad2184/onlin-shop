from django.core.management.base import BaseCommand
from django.core.files.storage import default_storage
from django.conf import settings
import os
import requests


class Command(BaseCommand):
    help = "Download product images from Supabase to local media"

    def handle(self, *args, **kwargs):
        # Temporarily use your Supabase public URL here
        base_url = (
            "https://sxkayxygouvjhortiqbb.supabase.co"
            "/storage/v1/object/public/media/"
        )

        # Get image paths from the database
        from products.models import ProductImage

        images = ProductImage.objects.exclude(image="")

        for obj in images:
            path = obj.image.name
            local_path = os.path.join(settings.MEDIA_ROOT, path)

            if os.path.exists(local_path):
                self.stdout.write(f"Already exists: {path}")
                continue

            url = base_url + path

            response = requests.get(url)

            if response.status_code == 200:
                os.makedirs(os.path.dirname(local_path), exist_ok=True)

                with open(local_path, "wb") as f:
                    f.write(response.content)

                self.stdout.write(self.style.SUCCESS(f"Downloaded: {path}"))
            else:
                self.stdout.write(
                    self.style.ERROR(
                        f"Failed: {path} ({response.status_code})"
                    )
                )