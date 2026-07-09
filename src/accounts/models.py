from django.db import models
from django.contrib.auth.models import AbstractUser


 

class CustomUser(AbstractUser):
    phone = models.CharField(max_length=50, null=True, blank=True)
    profile = models.ImageField(upload_to='profiles/', blank=True, null=True)
