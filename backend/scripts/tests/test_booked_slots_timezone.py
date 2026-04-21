#!/usr/bin/env python
import os
import sys
import django

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Business
from django.test import RequestFactory
from api.views.reservation import ReservationViewSet

print("\n" + "="*60)
print("TESTING BOOKED SLOTS TIMEZONE CONVERSION")
print("="*60)

business = Business.objects.filter(subdomain='mega').first()
if not business:
    print("❌ Business 'mega' not found")
    sys.exit(1)

# Test for April 21, 2026 (the date with confirmed reservations)
test_date = '2026-04-21'

print(f"\n📅 Testing date: {test_date}")
print(f"🏢 Business: {business.name} (subdomain: {business.subdomain})")

factory = RequestFactory()
request = factory.get(
    f'/api/reservations/booked_slots/',
    {'date': test_date, 'subdomain': business.subdomain}
)

view = ReservationViewSet.as_view({'get': 'booked_slots'})
response = view(request)

print(f"\n📊 Response Status: {response.status_code}")

if response.status_code == 200:
    data = response.data
    print(f"\n✅ Success! Booked slots returned:")
    print(f"   Date: {data.get('date')}")
    print(f"   Booked slots count: {len(data.get('booked_slots', []))}")
    
    print(f"\n   Booked time slots (LOCAL TIME):")
    for slot in sorted(data.get('booked_slots', []), key=lambda x: x['start']):
        print(f"   - {slot['start']} to {slot['end']}")
    
    print(f"\n✅ These times should match what you see in the admin panel!")
    print(f"   If you booked at 20:00 (8:00 PM), it should show as 20:00 here.")
else:
    print(f"❌ Error: {response.data}")

print("\n" + "="*60)
