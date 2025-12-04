from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('REPRESENTANTE', 'Representante'),
        ('DOCENTE', 'Docente'),
        ('ADMINISTRADOR', 'Administrador'),
        ('OFICINISTA', 'Oficinista'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='REPRESENTANTE')
    
    # Additional fields can be added here
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    visible_password = models.CharField(max_length=128, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
