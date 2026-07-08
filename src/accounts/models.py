from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser


user = settings.AUTH_USER_MODEL


class CustomUser(AbstractUser):
    phone = models.CharField(max_length=50)
    profile = models.ImageField(upload_to='profiles/', blank=True, null=True)
