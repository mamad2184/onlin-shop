from django.db import models
from django.contrib.auth.models import AbstractUser




from utils.accounts.models import profile_image_path


 

class CustomUser(AbstractUser):
    phone = models.CharField(max_length=50, null=True, blank=True)
    profile = models.ImageField(upload_to=profile_image_path , blank=True, null=True)
