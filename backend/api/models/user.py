from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
import uuid

class UserManager(BaseUserManager):
    """Custom user manager for our User model"""
    
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('user_type', 'super_admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model with only the fields we need"""
    
    USER_TYPE_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('business_owner', 'Business Owner'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, help_text="Email address (used for login)")
    first_name = models.CharField(max_length=50, help_text="First name")
    last_name = models.CharField(max_length=50, help_text="Last name")
    phone = models.CharField(max_length=20, blank=True, help_text="Phone number")
    
    # User type and business relationship
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='business_owner')
    business = models.ForeignKey(
        'Business', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='users',
        help_text="Business this user belongs to (null for super admins)"
    )
    
    # System fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # For Django admin access
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ['first_name', 'last_name']
    
    def __str__(self):
        if self.business:
            return f"{self.get_full_name()} ({self.business.name})"
        return f"{self.get_full_name()} (Super Admin)"
    
    def get_full_name(self):
        """Return the full name of the user"""
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        """Return the short name for the user"""
        return self.first_name
    
    @property
    def username(self):
        """Backward compatibility property"""
        return self.email
    
    @property
    def is_admin(self):
        """Backward compatibility - check if user is admin"""
        return self.user_type == 'super_admin' or self.is_staff
    
    @property
    def is_super_admin(self):
        """Check if user is a super admin"""
        return self.user_type == 'super_admin'
    
    @property
    def is_business_owner(self):
        """Check if user is a business owner"""
        return self.user_type == 'business_owner'
    
    