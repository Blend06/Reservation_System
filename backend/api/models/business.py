from django.db import models
from django.core.validators import RegexValidator
import uuid

class Business(models.Model):
    """
    Business model for multi-tenant SaaS
    Each business gets their own subdomain and isolated data
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, help_text="Business name")
    subdomain = models.CharField(
        max_length=50, 
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^[a-z0-9-]+$',
                message='Subdomain can only contain lowercase letters, numbers, and hyphens'
            )
        ],
        help_text="Subdomain for business (e.g., 'salon' for salon.yourdomain.com)"
    )
    
    # Contact Information
    email = models.EmailField(help_text="Business contact email")
    phone = models.CharField(max_length=20, blank=True)
    
    # Business Settings
    business_hours_start = models.TimeField(default='09:00', help_text="Business opening time")
    business_hours_end = models.TimeField(default='18:00', help_text="Business closing time")
    timezone = models.CharField(max_length=50, default='Europe/Berlin')
    
    # Email Configuration
    email_from_name = models.CharField(max_length=100, help_text="Name shown in emails")
    email_from_address = models.EmailField(blank=True, help_text="Custom from email (optional)")
    
    # Branding
    primary_color = models.CharField(max_length=7, default='#3B82F6', help_text="Primary brand color (hex)")
    logo_url = models.URLField(blank=True, help_text="Logo URL (optional)")
    
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Subscription info (for future use)
    subscription_status = models.CharField(
        max_length=20,
        choices=[
            ('trial', 'Trial'),
            ('active', 'Active'),
            ('suspended', 'Suspended'),
            ('cancelled', 'Cancelled'),
        ],
        default='trial'
    )
    subscription_expires = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Business"
        verbose_name_plural = "Businesses"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.subdomain})"
    
    @property
    def full_domain(self):
        """Return the full subdomain URL"""
        return f"{self.subdomain}.yourdomain.com"
    
    @property
    def admin_email(self):
        """Return the email address for admin notifications"""
        return self.email_from_address or self.email