from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Reservation(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("canceled", "Canceled"),
        ("completed", "Completed"),
    ]

    # Multi-tenant field - CRITICAL for data isolation
    business = models.ForeignKey(
        'Business', 
        on_delete=models.CASCADE,
        related_name='reservations',
        help_text="Business this reservation belongs to"
    )
    
    # Customer info (no user account needed)
    customer_name = models.CharField(max_length=100, help_text="Customer's full name")
    customer_email = models.EmailField(help_text="Customer's email address")
    customer_phone = models.CharField(max_length=20, blank=True, help_text="Customer's phone number")
    
    # Reservation details
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    notes = models.TextField(blank=True, help_text="Special requests or notes")
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Keep customer field for backward compatibility during migration
    customer = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="reservations",
        null=True,
        blank=True,
        help_text="Legacy field - will be removed after migration"
    )

    # Managers
    # objects = TenantAwareManager()  # Will add this after migrations
    # all_objects = models.Manager()

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['business', 'status']),
            models.Index(fields=['business', 'start_time']),
            models.Index(fields=['customer_email']),
        ]

    def __str__(self):
        return f"{self.customer_name} @ {self.start_time} ({self.business.name})"
    
    @property
    def customer_display_name(self):
        """Return customer name for display"""
        return self.customer_name or (self.customer.get_full_name() if self.customer else "Unknown")
    
    @property
    def customer_display_email(self):
        """Return customer email for display"""
        return self.customer_email or (self.customer.email if self.customer else "")