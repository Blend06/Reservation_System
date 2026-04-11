#!/usr/bin/env python
"""
Quick SMS test script
Run from project root: docker exec -it fade_district-backend-1 python scripts/tests/test_sms.py
"""
import os
import sys
import django

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.utils.sms_utils import send_sms
from django.conf import settings

print("=" * 60)
print("📱 TWILIO SMS TEST")
print("=" * 60)
print()
print("Configuration:")
print(f"  Account SID: {settings.TWILIO_ACCOUNT_SID[:10]}...")
print(f"  Auth Token: {'*' * 20}")
print(f"  From Number: {settings.TWILIO_PHONE_NUMBER}")
print()

# Replace with YOUR phone number (include country code!)
YOUR_PHONE = "+38345853844"  # ← CHANGE THIS TO YOUR ACTUAL PHONE!

print(f"Sending test SMS to: {YOUR_PHONE}")
print()

result = send_sms(
    YOUR_PHONE, 
    "🎉 Test message from Reservo! Your SMS system is working perfectly!"
)

print()
if result:
    print("✅ SUCCESS! Check your phone for the SMS.")
    print()
    print("Next steps:")
    print("  1. Check your phone for the message")
    print("  2. Test with a real reservation")
    print("  3. Monitor costs in Twilio Console")
else:
    print("❌ FAILED! Check the error above.")
    print()
    print("Common issues:")
    print("  1. Wrong Account SID or Auth Token")
    print("  2. Phone number not owned by this account")
    print("  3. Account not upgraded (trial restrictions)")
    print("  4. Invalid phone number format")
    print()
    print("To fix:")
    print("  1. Go to https://console.twilio.com/")
    print("  2. Verify your Account SID and Auth Token")
    print("  3. Check Phone Numbers → Active numbers")
    print("  4. Make sure the number matches your .env file")

print("=" * 60)
