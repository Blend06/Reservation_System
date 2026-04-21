#!/usr/bin/env python
import os
import sys
import django

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Reservation
from datetime import datetime

print("\n" + "="*60)
print("CONFIRMED RESERVATIONS FOR MEGA")
print("="*60)

reservations = Reservation.objects.filter(
    status='confirmed',
    business__subdomain='mega'
).order_by('start_time')[:10]

for r in reservations:
    print(f"\nID: {r.id}")
    print(f"Customer: {r.customer_name}")
    print(f"Start Time (UTC): {r.start_time}")
    print(f"Start Time (Local): {r.start_time.astimezone()}")
    print(f"Date: {r.start_time.date()}")
    print(f"Time (HH:MM): {r.start_time.strftime('%H:%M')}")
    print(f"Status: {r.status}")

print("\n" + "="*60)
