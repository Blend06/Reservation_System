#!/usr/bin/env python
"""
Test script for double booking prevention system.
Tests the booked_slots endpoint and verifies time slots are correctly filtered.
"""
import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Business, Reservation
from django.contrib.auth import get_user_model
from django.test import RequestFactory
from api.views.reservation import ReservationViewSet

User = get_user_model()

def test_booked_slots():
    """Test the booked_slots endpoint"""
    print("\n" + "="*60)
    print("TESTING DOUBLE BOOKING PREVENTION SYSTEM")
    print("="*60)
    
    # Get or create test business
    try:
        business = Business.objects.filter(subdomain='mega').first()
        if not business:
            print("❌ Test business 'mega' not found. Please create it first.")
            return
        
        print(f"\n✅ Found test business: {business.name} (subdomain: {business.subdomain})")
        
        # Create test date (tomorrow)
        test_date = (datetime.now() + timedelta(days=1)).date()
        test_date_str = test_date.strftime('%Y-%m-%d')
        
        print(f"\n📅 Test date: {test_date_str}")
        
        # Create confirmed reservations for testing
        test_times = [
            ('09:00', '10:00'),
            ('14:00', '15:00'),
            ('19:00', '20:00'),
        ]
        
        print("\n📝 Creating test reservations...")
        created_reservations = []
        
        for start_time, end_time in test_times:
            start_datetime = datetime.strptime(f"{test_date_str} {start_time}", '%Y-%m-%d %H:%M')
            end_datetime = datetime.strptime(f"{test_date_str} {end_time}", '%Y-%m-%d %H:%M')
            
            # Check if reservation already exists
            existing = Reservation.objects.filter(
                business=business,
                start_time=start_datetime,
                status='confirmed'
            ).first()
            
            if existing:
                print(f"  ⏭️  Reservation at {start_time} already exists (ID: {existing.id})")
                created_reservations.append(existing)
            else:
                reservation = Reservation.objects.create(
                    business=business,
                    customer_name='Test Customer',
                    customer_phone='+38344123456',
                    start_time=start_datetime,
                    end_time=end_datetime,
                    status='confirmed'
                )
                print(f"  ✅ Created reservation at {start_time}-{end_time} (ID: {reservation.id})")
                created_reservations.append(reservation)
        
        # Test the booked_slots endpoint
        print(f"\n🔍 Testing booked_slots endpoint...")
        print(f"   URL: /api/reservations/booked_slots/?date={test_date_str}&subdomain={business.subdomain}")
        
        factory = RequestFactory()
        request = factory.get(
            f'/api/reservations/booked_slots/',
            {'date': test_date_str, 'subdomain': business.subdomain}
        )
        
        view = ReservationViewSet.as_view({'get': 'booked_slots'})
        response = view(request)
        
        print(f"\n📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.data
            print(f"✅ Success! Booked slots returned:")
            print(f"   Date: {data.get('date')}")
            print(f"   Booked slots count: {len(data.get('booked_slots', []))}")
            
            for slot in data.get('booked_slots', []):
                print(f"   - {slot['start']} to {slot['end']}")
            
            # Verify the slots match what we created
            expected_slots = len(test_times)
            actual_slots = len(data.get('booked_slots', []))
            
            if actual_slots >= expected_slots:
                print(f"\n✅ PASS: Found {actual_slots} booked slots (expected at least {expected_slots})")
            else:
                print(f"\n❌ FAIL: Found {actual_slots} booked slots (expected at least {expected_slots})")
        else:
            print(f"❌ Error: {response.data}")
        
        # Test with pending reservation (should not be included)
        print(f"\n🔍 Testing that PENDING reservations are NOT included...")
        pending_start = datetime.strptime(f"{test_date_str} 11:00", '%Y-%m-%d %H:%M')
        pending_end = datetime.strptime(f"{test_date_str} 12:00", '%Y-%m-%d %H:%M')
        
        pending_reservation = Reservation.objects.create(
            business=business,
            customer_name='Pending Customer',
            customer_phone='+38344999999',
            start_time=pending_start,
            end_time=pending_end,
            status='pending'
        )
        print(f"  ✅ Created PENDING reservation at 11:00-12:00 (ID: {pending_reservation.id})")
        
        # Query again
        response = view(request)
        if response.status_code == 200:
            data = response.data
            booked_times = [slot['start'] for slot in data.get('booked_slots', [])]
            
            if '11:00' not in booked_times:
                print(f"  ✅ PASS: Pending reservation at 11:00 is NOT in booked slots (correct!)")
            else:
                print(f"  ❌ FAIL: Pending reservation at 11:00 IS in booked slots (should not be!)")
        
        # Cleanup
        print(f"\n🧹 Cleaning up test data...")
        for reservation in created_reservations:
            reservation.delete()
            print(f"  🗑️  Deleted reservation ID: {reservation.id}")
        
        pending_reservation.delete()
        print(f"  🗑️  Deleted pending reservation ID: {pending_reservation.id}")
        
        print("\n" + "="*60)
        print("✅ TEST COMPLETED SUCCESSFULLY")
        print("="*60)
        print("\nNext steps:")
        print("1. Open the public booking page in your browser")
        print(f"2. Navigate to: http://localhost:3000/book/{business.subdomain}")
        print("3. Select tomorrow's date")
        print("4. Verify that time slots are displayed correctly")
        print("5. Create a confirmed reservation for a specific time")
        print("6. Refresh the booking page and verify that time is hidden")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_booked_slots()
