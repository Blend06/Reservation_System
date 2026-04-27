"""
Export database to SQL backup file.
Run from backend container:
    python manage.py shell -c "exec(open('scripts/db/export_backup.py').read())"

Backup files are saved to scripts/db/backup/
"""
import os
import sys
from datetime import datetime

# Determine backup output directory
# In Docker container, working dir is /app (backend root)
BACKUP_OUTPUT_DIR = '/app/scripts/db/backup'

# Django setup (skip if already configured via manage.py shell)
if 'django' not in sys.modules or not sys.modules['django'].conf.settings.configured:
    sys.path.insert(0, '/app')
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
from api.models import Business, Reservation
from api.models.staff import Staff

User = get_user_model()

def escape_sql(value):
    """Escape single quotes for SQL strings."""
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, list):
        import json
        return f"'{json.dumps(value)}'"
    return f"'{str(value).replace(chr(39), chr(39)+chr(39))}'"

def format_datetime(dt):
    """Format datetime for SQL."""
    if dt is None:
        return 'NULL'
    return f"'{dt.isoformat()}'"

def format_time(t):
    """Format time for SQL."""
    if t is None:
        return 'NULL'
    return f"'{t}'"

def format_uuid(u):
    """Format UUID for SQL."""
    if u is None:
        return 'NULL'
    return f"'{str(u)}'"


def export_businesses(f):
    """Export all businesses."""
    businesses = Business.objects.all()
    if not businesses.exists():
        f.write("-- No businesses to export\n\n")
        return
    
    f.write("-- ═══════════════════════════════════════════════════════════════════════════\n")
    f.write("-- BUSINESSES\n")
    f.write("-- ═══════════════════════════════════════════════════════════════════════════\n\n")
    
    for b in businesses:
        f.write(f"""INSERT INTO api_business (
    id, name, business_type, subdomain, email, phone,
    business_hours_start, business_hours_end, timezone,
    email_from_name, email_from_address, primary_color,
    logo, logo_url, is_active, subscription_status, subscription_expires,
    created_at, updated_at
) VALUES (
    {format_uuid(b.id)}, {escape_sql(b.name)}, {escape_sql(b.business_type)}, {escape_sql(b.subdomain)},
    {escape_sql(b.email)}, {escape_sql(b.phone)},
    {format_time(b.business_hours_start)}, {format_time(b.business_hours_end)}, {escape_sql(b.timezone)},
    {escape_sql(b.email_from_name)}, {escape_sql(b.email_from_address)}, {escape_sql(b.primary_color)},
    {escape_sql(str(b.logo) if b.logo else '')}, {escape_sql(b.logo_url)},
    {escape_sql(b.is_active)}, {escape_sql(b.subscription_status)}, {format_datetime(b.subscription_expires)},
    {format_datetime(b.created_at)}, {format_datetime(b.updated_at)}
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, business_type = EXCLUDED.business_type, subdomain = EXCLUDED.subdomain,
    email = EXCLUDED.email, phone = EXCLUDED.phone, is_active = EXCLUDED.is_active;

""")
    f.write(f"-- Exported {businesses.count()} businesses\n\n")


def export_users(f):
    """Export all users (passwords are hashed)."""
    users = User.objects.all()
    if not users.exists():
        f.write("-- No users to export\n\n")
        return
    
    f.write("-- ═══════════════════════════════════════════════════════════════════════════\n")
    f.write("-- USERS (passwords are hashed, use Django to reset if needed)\n")
    f.write("-- ═══════════════════════════════════════════════════════════════════════════\n\n")
    
    for u in users:
        business_id = format_uuid(u.business_id) if u.business_id else 'NULL'
        f.write(f"""INSERT INTO api_user (
    id, email, password, first_name, last_name, phone,
    user_type, business_id, is_active, is_staff, is_superuser,
    created_at, updated_at, last_login
) VALUES (
    {format_uuid(u.id)}, {escape_sql(u.email)}, {escape_sql(u.password)},
    {escape_sql(u.first_name)}, {escape_sql(u.last_name)}, {escape_sql(u.phone)},
    {escape_sql(u.user_type)}, {business_id}, {escape_sql(u.is_active)},
    {escape_sql(u.is_staff)}, {escape_sql(u.is_superuser)},
    {format_datetime(u.created_at)}, {format_datetime(u.updated_at)}, {format_datetime(u.last_login)}
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

""")
    f.write(f"-- Exported {users.count()} users\n\n")


def export_staff(f):
    """Export all staff members."""
    staff = Staff.objects.all()
    if not staff.exists():
        f.write("-- No staff to export\n\n")
        return
    
    f.write("-- ═══════════════════════════════════════════════════════════════════════════\n")
    f.write("-- STAFF MEMBERS\n")
    f.write("-- ═══════════════════════════════════════════════════════════════════════════\n\n")
    
    for s in staff:
        f.write(f"""INSERT INTO api_staff (
    id, business_id, name, rest_days, is_active, created_at
) VALUES (
    {s.id}, {format_uuid(s.business_id)}, {escape_sql(s.name)},
    {escape_sql(s.rest_days)}, {escape_sql(s.is_active)}, {format_datetime(s.created_at)}
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name, rest_days = EXCLUDED.rest_days, is_active = EXCLUDED.is_active;

""")
    f.write(f"-- Exported {staff.count()} staff members\n\n")


def export_reservations(f):
    """Export all reservations."""
    reservations = Reservation.objects.all()
    if not reservations.exists():
        f.write("-- No reservations to export\n\n")
        return
    
    f.write("-- ═══════════════════════════════════════════════════════════════════════════\n")
    f.write("-- RESERVATIONS\n")
    f.write("-- ═══════════════════════════════════════════════════════════════════════════\n\n")
    
    for r in reservations:
        staff_id = r.staff_id if r.staff_id else 'NULL'
        customer_id = format_uuid(r.customer_id) if r.customer_id else 'NULL'
        f.write(f"""INSERT INTO api_reservation (
    id, business_id, customer_name, customer_email, customer_phone,
    start_time, end_time, status, notes, staff_id, customer_id,
    created_at, updated_at
) VALUES (
    {r.id}, {format_uuid(r.business_id)}, {escape_sql(r.customer_name)},
    {escape_sql(r.customer_email)}, {escape_sql(r.customer_phone)},
    {format_datetime(r.start_time)}, {format_datetime(r.end_time)},
    {escape_sql(r.status)}, {escape_sql(r.notes)}, {staff_id}, {customer_id},
    {format_datetime(r.created_at)}, {format_datetime(r.updated_at)}
) ON CONFLICT (id) DO NOTHING;

""")
    f.write(f"-- Exported {reservations.count()} reservations\n\n")


def main():
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_dir = BACKUP_OUTPUT_DIR
    filename = os.path.join(backup_dir, f'backup_{timestamp}.sql')
    
    print(f"Exporting database backup to: {filename}")
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(f"""-- ═══════════════════════════════════════════════════════════════════════════
-- FADE DISTRICT DATABASE BACKUP
-- Generated: {datetime.now().isoformat()}
-- ═══════════════════════════════════════════════════════════════════════════
-- 
-- RESTORE INSTRUCTIONS:
-- 1. Ensure PostgreSQL is running and database exists
-- 2. Run Django migrations first: python manage.py migrate
-- 3. Then import this file: psql -U postgres -d fade_district -f backup_XXXXXX.sql
-- 
-- Or via Docker:
--   docker compose exec db psql -U postgres -d fade_district -f /path/to/backup.sql
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

""")
        
        export_businesses(f)
        export_users(f)
        export_staff(f)
        export_reservations(f)
        
        f.write("COMMIT;\n")
        f.write("\n-- ═══════════════════════════════════════════════════════════════════════════\n")
        f.write("-- BACKUP COMPLETE\n")
        f.write("-- ═══════════════════════════════════════════════════════════════════════════\n")
    
    print(f"\n✅ Backup created successfully!")
    print(f"   Businesses:   {Business.objects.count()}")
    print(f"   Users:        {User.objects.count()}")
    print(f"   Staff:        {Staff.objects.count()}")
    print(f"   Reservations: {Reservation.objects.count()}")
    print(f"\nFile: {filename}")


if __name__ == '__main__':
    main()
else:
    # Running via exec() in manage.py shell
    main()
