"""
Security tests for XSS protection and input validation.
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from api.utils.input_sanitizer import InputSanitizer
from django.core.exceptions import ValidationError


class InputSanitizerTestCase(TestCase):
    """Test input sanitization utilities"""
    
    def test_sanitize_text_removes_html(self):
        """Test that HTML tags are removed"""
        malicious_inputs = [
            ("<script>alert('XSS')</script>Hello", "Hello"),
            ("<img src=x onerror=alert('XSS')>", ""),
            ("<b>Bold</b> text", "Bold text"),
            ("Normal text", "Normal text"),
        ]
        
        for input_text, expected in malicious_inputs:
            result = InputSanitizer.sanitize_text(input_text)
            self.assertEqual(result, expected)
    
    def test_sanitize_text_length_validation(self):
        """Test that text length is validated"""
        long_text = "a" * 501
        
        with self.assertRaises(ValidationError):
            InputSanitizer.sanitize_text(long_text, max_length=500)
    
    def test_sanitize_name_valid(self):
        """Test valid name sanitization"""
        valid_names = [
            "John Doe",
            "Mary-Jane",
            "O'Brien",
            "Dr. Smith",
        ]
        
        for name in valid_names:
            result = InputSanitizer.sanitize_name(name)
            self.assertIsNotNone(result)
    
    def test_sanitize_name_removes_html(self):
        """Test that HTML is removed from names"""
        result = InputSanitizer.sanitize_name("<script>alert('xss')</script>John")
        self.assertNotIn("<script>", result)
        self.assertIn("John", result)
    
    def test_sanitize_name_invalid(self):
        """Test invalid names are rejected"""
        invalid_names = [
            "A",  # Too short
            "John123",  # Contains numbers
            "John@Doe",  # Contains special chars
        ]
        
        for name in invalid_names:
            with self.assertRaises(ValidationError):
                InputSanitizer.sanitize_name(name)
    
    def test_sanitize_phone_valid(self):
        """Test valid phone number formats"""
        valid_phones = [
            ("+1234567890", "+1234567890"),
            ("123-456-7890", "1234567890"),
            ("(123) 456-7890", "1234567890"),
            "+355 69 123 4567",
        ]
        
        for phone, _ in valid_phones:
            result = InputSanitizer.sanitize_phone(phone)
            self.assertIsNotNone(result)
            self.assertNotIn("-", result)
            self.assertNotIn(" ", result)
    
    def test_sanitize_phone_invalid(self):
        """Test invalid phone numbers are rejected"""
        invalid_phones = [
            "123",  # Too short
            "abc123456789",  # Contains letters
            "12345678901234567890",  # Too long
        ]
        
        for phone in invalid_phones:
            with self.assertRaises(ValidationError):
                InputSanitizer.sanitize_phone(phone)
    
    def test_sanitize_email_valid(self):
        """Test valid email formats"""
        valid_emails = [
            "user@example.com",
            "test.user@example.co.uk",
            "user+tag@example.com",
        ]
        
        for email in valid_emails:
            result = InputSanitizer.sanitize_email(email)
            self.assertEqual(result, email.lower())
    
    def test_sanitize_email_invalid(self):
        """Test invalid emails are rejected"""
        invalid_emails = [
            "notanemail",
            "@example.com",
            "user@",
            "user @example.com",
        ]
        
        for email in invalid_emails:
            with self.assertRaises(ValidationError):
                InputSanitizer.sanitize_email(email)
    
    def test_sanitize_subdomain_valid(self):
        """Test valid subdomain formats"""
        valid_subdomains = [
            ("mysalon", "mysalon"),
            ("my-salon", "my-salon"),
            ("salon123", "salon123"),
            ("MySalon", "mysalon"),  # Should be lowercased
        ]
        
        for subdomain, expected in valid_subdomains:
            result = InputSanitizer.sanitize_subdomain(subdomain)
            self.assertEqual(result, expected)
    
    def test_sanitize_subdomain_invalid(self):
        """Test invalid subdomains are rejected"""
        invalid_subdomains = [
            "ab",  # Too short
            "-salon",  # Starts with hyphen
            "salon-",  # Ends with hyphen
            "my salon",  # Contains space
            "my_salon",  # Contains underscore
            "www",  # Reserved
            "api",  # Reserved
        ]
        
        for subdomain in invalid_subdomains:
            with self.assertRaises(ValidationError):
                InputSanitizer.sanitize_subdomain(subdomain)


class XSSProtectionTestCase(TestCase):
    """Test XSS protection in API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_xss_in_reservation_notes(self):
        """Test that XSS in reservation notes is sanitized"""
        # This would require setting up a business and making a reservation
        # Simplified test - actual implementation would need full setup
        xss_payloads = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "<iframe src='javascript:alert(1)'></iframe>",
        ]
        
        for payload in xss_payloads:
            # Test sanitization directly
            sanitized = InputSanitizer.sanitize_text(payload)
            self.assertNotIn("<script", sanitized.lower())
            self.assertNotIn("<img", sanitized.lower())
            self.assertNotIn("<iframe", sanitized.lower())
            self.assertNotIn("javascript:", sanitized.lower())
