from django.db import models
from django.conf import settings

class ExchangeRate(models.Model):
    date = models.DateField(auto_now_add=True)
    rate = models.DecimalField(max_digits=10, decimal_places=2) # Bs per USD
    
    def __str__(self):
        return f"{self.date}: {self.rate} Bs/USD"

class PaymentConcept(models.Model):
    name = models.CharField(max_length=200) # e.g. "Mensualidad Noviembre"
    amount_usd = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (${self.amount_usd})"

class Payment(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'En Revisión'),
        ('VERIFIED', 'Aprobado'),
        ('REJECTED', 'Rechazado'),
    )
    
    student = models.ForeignKey('academic.Student', on_delete=models.CASCADE, related_name='payments')
    # Link to the concept (optional to allow legacy or ad-hoc payments if needed, but intended for monthly fees)
    payment_concept = models.ForeignKey(PaymentConcept, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    
    amount_usd = models.DecimalField(max_digits=10, decimal_places=2)
    amount_bs = models.DecimalField(max_digits=12, decimal_places=2)
    rate_applied = models.DecimalField(max_digits=10, decimal_places=2)
    date_reported = models.DateTimeField(auto_now_add=True)
    # concept field kept for backward compatibility or custom text, but UI will prefer payment_concept
    concept = models.CharField(max_length=200) 
    reference_number = models.CharField(max_length=50)
    proof_image = models.ImageField(upload_to='payments/')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    admin_note = models.TextField(blank=True, null=True)
    
    # Billing info
    billing_name = models.CharField(max_length=200, blank=True)
    billing_id = models.CharField(max_length=50, blank=True) # RIF
    billing_address = models.TextField(blank=True)

    def __str__(self):
        return f"{self.student} - {self.amount_usd}$ ({self.status})"
