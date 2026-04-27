#!/usr/bin/env python
"""
Quick security test script for Docker
Run with: docker-compose run --rm backend python test_security_docker.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.utils.input_sanitizer import InputSanitizer
from django.core.exceptions import ValidationError

def test_xss_protection():
    """Test XSS protection"""
    print("\n🔒 Testing XSS Protection...")
    
    tests = [
        ("<script>alert('XSS')</script>Hello", "alert('XSS')Hello"),  # Removes tags, keeps text
        ("<img src=x onerror=alert('XSS')>", ""),
        ("<b>Bold</b> text", "Bold text"),
        ("Normal text", "Normal text"),
        ("<iframe src='javascript:alert(1)'></iframe>", ""),
    ]
    
    passed = 0
    for input_text, expected in tests:
        result = InputSanitizer.sanitize_text(input_text)
        if result == expected:
            print(f"  ✅ PASS: {repr(input_text[:40])} → {repr(result)}")
            passed += 1
        else:
            print(f"  ❌ FAIL: {repr(input_text[:40])} → Expected {repr(expected)}, got {repr(result)}")
    
    print(f"\n  XSS Tests: {passed}/{len(tests)} passed")
    return passed == len(tests)

def test_phone_validation():
    """Test phone number validation"""
    print("\n📞 Testing Phone Validation...")
    
    valid_phones = [
        "+1234567890",
        "123-456-7890",
        "(123) 456-7890",
    ]
    
    invalid_phones = [
        "123",  # Too short
        "abc123456789",  # Contains letters
    ]
    
    passed = 0
    total = len(valid_phones) + len(invalid_phones)
    
    # Test valid phones
    for phone in valid_phones:
        try:
            result = InputSanitizer.sanitize_phone(phone)
            print(f"  ✅ PASS: {phone} → {result}")
            passed += 1
        except ValidationError as e:
            print(f"  ❌ FAIL: {phone} should be valid but got error: {e}")
    
    # Test invalid phones
    for phone in invalid_phones:
        try:
            result = InputSanitizer.sanitize_phone(phone)
            print(f"  ❌ FAIL: {phone} should be invalid but passed: {result}")
        except ValidationError:
            print(f"  ✅ PASS: {phone} correctly rejected")
            passed += 1
    
    print(f"\n  Phone Tests: {passed}/{total} passed")
    return passed == total

def test_email_validation():
    """Test email validation"""
    print("\n📧 Testing Email Validation...")
    
    valid_emails = [
        "user@example.com",
        "test.user@example.co.uk",
    ]
    
    invalid_emails = [
        "notanemail",
        "@example.com",
    ]
    
    passed = 0
    total = len(valid_emails) + len(invalid_emails)
    
    # Test valid emails
    for email in valid_emails:
        try:
            result = InputSanitizer.sanitize_email(email)
            print(f"  ✅ PASS: {email} → {result}")
            passed += 1
        except ValidationError as e:
            print(f"  ❌ FAIL: {email} should be valid but got error: {e}")
    
    # Test invalid emails
    for email in invalid_emails:
        try:
            result = InputSanitizer.sanitize_email(email)
            print(f"  ❌ FAIL: {email} should be invalid but passed: {result}")
        except ValidationError:
            print(f"  ✅ PASS: {email} correctly rejected")
            passed += 1
    
    print(f"\n  Email Tests: {passed}/{total} passed")
    return passed == total

def test_name_validation():
    """Test name validation"""
    print("\n👤 Testing Name Validation...")
    
    valid_names = [
        "John Doe",
        "Mary-Jane",
        "O'Brien",
    ]
    
    invalid_names = [
        "A",  # Too short
        "John123",  # Contains numbers
    ]
    
    passed = 0
    total = len(valid_names) + len(invalid_names)
    
    # Test valid names
    for name in valid_names:
        try:
            result = InputSanitizer.sanitize_name(name)
            print(f"  ✅ PASS: {name} → {result}")
            passed += 1
        except ValidationError as e:
            print(f"  ❌ FAIL: {name} should be valid but got error: {e}")
    
    # Test invalid names
    for name in invalid_names:
        try:
            result = InputSanitizer.sanitize_name(name)
            print(f"  ❌ FAIL: {name} should be invalid but passed: {result}")
        except ValidationError:
            print(f"  ✅ PASS: {name} correctly rejected")
            passed += 1
    
    print(f"\n  Name Tests: {passed}/{total} passed")
    return passed == total

def main():
    print("=" * 60)
    print("🔐 SECURITY TESTS - Docker Environment")
    print("=" * 60)
    
    # Check bleach is installed
    try:
        import bleach
        print(f"\n✅ Bleach installed: version {bleach.__version__}")
    except ImportError:
        print("\n❌ Bleach not installed!")
        return False
    
    # Run all tests
    results = []
    results.append(("XSS Protection", test_xss_protection()))
    results.append(("Phone Validation", test_phone_validation()))
    results.append(("Email Validation", test_email_validation()))
    results.append(("Name Validation", test_name_validation()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {status}: {test_name}")
    
    print(f"\n  Total: {passed_count}/{total_count} test suites passed")
    
    if passed_count == total_count:
        print("\n🎉 All security tests passed!")
        return True
    else:
        print(f"\n⚠️  {total_count - passed_count} test suite(s) failed")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
