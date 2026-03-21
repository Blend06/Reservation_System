"""
Seeder: Populate existing TestAdmin business with dummy data
Run from backend directory:
    python manage.py shell < ../scripts/seeder/seed_test_business.py
"""
import os, sys, django, random
from datetime import timedelta
from django.utils import timezone

if __name__ == '__main__':
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    django.setup()

from api.models import Business, Reservation
from api.models.staff import Staff

# ── 1. Find existing business ────────────────────────────────────────────────
try:
    business = Business.objects.get(subdomain='testadmin')
    print(f"Found business: {business.name} (id={business.id})")
except Business.DoesNotExist:
    print("ERROR: Business with subdomain 'testadmin' not found. Create it first.")
    sys.exit(1)

# ── 2. Staff Members ─────────────────────────────────────────────────────────
staff_members = []
for i in range(1, 5):
    staff, created = Staff.objects.get_or_create(
        business=business,
        name=f'Staff_Member{i}',
        defaults={
            'rest_days': [5, 6] if i % 2 == 0 else [6],
            'is_active': True,
        }
    )
    staff_members.append(staff)
    print(f"{'Created' if created else 'Found'} staff: {staff.name}")

# ── 3. Reservations spread over last 6 months ────────────────────────────────
# Remove previous dummy reservations to avoid duplicates on re-run
deleted, _ = Reservation.objects.filter(
    business=business,
    customer_name__startswith='Klienti'
).delete()
if deleted:
    print(f"Cleared {deleted} existing dummy reservations")

STATUSES = [
    'pending', 'pending',
    'confirmed', 'confirmed', 'confirmed',
    'completed', 'completed', 'completed', 'completed',
    'canceled',
]

now = timezone.now()
count = 0

for i in range(1, 61):
    days_ago = random.randint(0, 180)
    hour = random.randint(9, 17)
    minute = random.choice([0, 30])
    start = (now - timedelta(days=days_ago)).replace(
        hour=hour, minute=minute, second=0, microsecond=0
    )
    end = start + timedelta(hours=1)
    status = random.choice(STATUSES)
    staff = random.choice(staff_members + [None])

    Reservation.objects.create(
        business=business,
        customer_name=f'Klienti{i}',
        customer_phone=f'+3834400{i:04d}',
        customer_email='',
        start_time=start,
        end_time=end,
        status=status,
        notes=f'Shënim test për Klientin {i}' if i % 4 == 0 else '',
        staff=staff,
    )
    count += 1

print(f"Created {count} reservations")
print("\n✅ Done!")
print(f"   Staff:   Staff_Member1 – Staff_Member4")
print(f"   Clients: Klienti1 – Klienti60")
