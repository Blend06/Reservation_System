"""
Input sanitization utilities for XSS protection and data validation.
Note: SQL injection is already prevented by Django ORM.
"""
import re
import bleach
from django.core.exceptions import ValidationError


class InputSanitizer:
    """Sanitize and validate user inputs to prevent XSS and ensure data quality"""
    
    @staticmethod
    def sanitize_text(text, max_length=500):
        """
        Remove HTML/JavaScript to prevent XSS attacks.
        Use for: notes, descriptions, any user-generated text content.
        """
        if not text:
            return text
        
        # Strip whitespace
        text = text.strip()
        
        # Length validation
        if len(text) > max_length:
            raise ValidationError(f"Text exceeds maximum length of {max_length} characters")
        
        # Remove ALL HTML tags and JavaScript (XSS protection)
        # strip=False keeps the text content, strip=True removes everything
        # We want to remove tags but keep safe text content
        cleaned = bleach.clean(text, tags=[], attributes={}, strip=True)
        
        return cleaned
    
    @staticmethod
    def sanitize_name(name, max_length=100):
        """
        Sanitize person/business names.
        Allows: letters, spaces, hyphens, apostrophes, dots
        """
        if not name:
            raise ValidationError("Name is required")
        
        name = name.strip()
        
        # Remove HTML/JavaScript
        name = bleach.clean(name, tags=[], attributes={}, strip=True)
        
        # Length validation
        if len(name) < 2:
            raise ValidationError("Name must be at least 2 characters")
        if len(name) > max_length:
            raise ValidationError(f"Name must not exceed {max_length} characters")
        
        # Check for numbers
        if re.search(r'\d', name):
            raise ValidationError("Name cannot contain numbers")
        
        # Allow only safe characters for names
        # Letters (any language), spaces, hyphens, apostrophes, dots
        if not re.match(r"^[\w\s\-'\.]+$", name, re.UNICODE):
            raise ValidationError("Name contains invalid characters")
        
        return name
    
    @staticmethod
    def sanitize_phone(phone):
        """
        Validate and sanitize phone numbers.
        Accepts international format: +1234567890 or local: 1234567890
        """
        if not phone:
            raise ValidationError("Phone number is required")
        
        original_phone = phone
        
        # Remove spaces, parentheses, dashes (common formatting)
        phone = re.sub(r'[\s\(\)\-]', '', phone.strip())
        
        # Check if contains any letters BEFORE removing them
        if re.search(r'[a-zA-Z]', phone):
            raise ValidationError("Phone number cannot contain letters")
        
        # Keep only digits and plus sign
        phone = re.sub(r'[^\d+]', '', phone)
        
        # Validate format: optional +, then 8-15 digits
        if not re.match(r'^\+?[\d]{8,15}$', phone):
            raise ValidationError(
                "Invalid phone number. Must be 8-15 digits, optionally starting with +"
            )
        
        return phone
    
    @staticmethod
    def sanitize_email(email):
        """
        Validate and sanitize email addresses.
        """
        if not email:
            return email  # Email is optional in some cases
        
        email = email.strip().lower()
        
        # Basic email format validation
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            raise ValidationError("Invalid email format")
        
        # Length check
        if len(email) > 254:  # RFC 5321
            raise ValidationError("Email address is too long")
        
        return email
    
    @staticmethod
    def sanitize_subdomain(subdomain):
        """
        Validate subdomain format for business subdomains.
        Allows: lowercase letters, numbers, hyphens (not at start/end)
        """
        if not subdomain:
            raise ValidationError("Subdomain is required")
        
        subdomain = subdomain.strip().lower()
        
        # Length validation
        if len(subdomain) < 3:
            raise ValidationError("Subdomain must be at least 3 characters")
        if len(subdomain) > 63:  # DNS label limit
            raise ValidationError("Subdomain must not exceed 63 characters")
        
        # Format validation: alphanumeric and hyphens, not starting/ending with hyphen
        if not re.match(r'^[a-z0-9]([a-z0-9-]*[a-z0-9])?$', subdomain):
            raise ValidationError(
                "Subdomain must contain only lowercase letters, numbers, and hyphens "
                "(not at the beginning or end)"
            )
        
        # Reserved subdomains
        reserved = ['www', 'api', 'admin', 'mail', 'ftp', 'localhost', 'staging', 'dev']
        if subdomain in reserved:
            raise ValidationError(f"Subdomain '{subdomain}' is reserved")
        
        return subdomain
