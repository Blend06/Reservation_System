"""
Seed initial data if database is empty.
Creates default super admin and optionally test business.

Run from backend container:
    python manage.py shell -c "exec(open('scripts/db/seed_initial_data.py').read())"
"""
import os
import sys

# Skip Django setup if already configured (running via manage.py shell)
if 'django' not in sys.modules or not sys.modules['django'].conf.settings.configured:
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..'))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    import django
    django.setup()

from django.contrib.auth import get_user_model
from api.models import Business

User = get_user_model()

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION - Edit these values as needed
# ═══════════════════════════════════════════════════════════════════════════════

SUPER_ADMIN = {
    'email': 'admin@fadedistrict.com',
    'password': 'Admin123!',
    'first_name': 'Super',
    'last_name': 'Admin',
    'phone': '+38344000001',
}

TEST_BUSINESS = {
    'subdomain': 'testadmin',
    'name': 'Test Admin Barbershop',
    'business_type': 'barbershop',
    'email': 'testadmin@example.com',
    'phone': '+38344000000',
    'business_hours_start': '09:00',
    'business_hours_end': '18:00',
}

TEST_BUSINESS_OWNER = {
    'email': 'testadmin@example.com',
    'password': 'Test123!',
    'first_name': 'Test',
    'last_name': 'Owner',
    'phone': '+38344000002',
}

# ═══════════════════════════════════════════════════════════════════════════════
# SEEDING LOGIC
# ═══════════════════════════════════════════════════════════════════════════════

def create_super_admin():
    """Create super admin user if doesn't exist."""
    user, created = User.objects.get_or_create(
        email=SUPER_ADMIN['email'],
        defaults={
            'first_name': SUPER_ADMIN['first_name'],
            'last_name': SUPER_ADMIN['last_name'],
            'phone': SUPER_ADMIN['phone'],
            'user_type': 'super_admin',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
        }
    )
    if created:
        user.set_password(SUPER_ADMIN['password'])
        user.save()
        print(f"✅ Created super admin: {user.email}")
        print(f"   Password: {SUPER_ADMIN['password']}")
    else:
        print(f"ℹ️  Super admin exists: {user.email}")
    return user


def create_test_business():
    """Create test business if doesn't exist."""
    business, created = Business.objects.get_or_create(
        subdomain=TEST_BUSINESS['subdomain'],
        defaults={
            'name': TEST_BUSINESS['name'],
            'business_type': TEST_BUSINESS['business_type'],
            'email': TEST_BUSINESS['email'],
            'phone': TEST_BUSINESS['phone'],
            'business_hours_start': TEST_BUSINESS['business_hours_start'],
            'business_hours_end': TEST_BUSINESS['business_hours_end'],
            'is_active': True,
        }
    )
    if created:
        print(f"✅ Created test business: {business.name} (subdomain: {business.subdomain})")
    else:
        print(f"ℹ️  Test business exists: {business.name}")
    return business


def create_test_business_owner(business):
    """Create test business owner user if doesn't exist."""
    user, created = User.objects.get_or_create(
        email=TEST_BUSINESS_OWNER['email'],
        defaults={
            'first_name': TEST_BUSINESS_OWNER['first_name'],
            'last_name': TEST_BUSINESS_OWNER['last_name'],
            'phone': TEST_BUSINESS_OWNER['phone'],
            'user_type': 'business_owner',
            'business': business,
            'is_active': True,
        }
    )
    if created:
        user.set_password(TEST_BUSINESS_OWNER['password'])
        user.save()
        print(f"✅ Created business owner: {user.email}")
        print(f"   Password: {TEST_BUSINESS_OWNER['password']}")
        print(f"   Linked to: {business.name}")
    else:
        # Ensure user is linked to business
        if user.business_id != business.id:
            user.business = business
            user.save()
            print(f"ℹ️  Business owner exists, linked to: {business.name}")
        else:
            print(f"ℹ️  Business owner exists: {user.email}")
    return user


def main():
    print("\n" + "═" * 60)
    print("FADE DISTRICT - INITIAL DATA SEEDING")
    print("═" * 60 + "\n")
    
    # 1. Create super admin
    print("1. Super Admin")
    print("-" * 40)
    super_admin = create_super_admin()
    print()
    
    # 2. Create test business
    print("2. Test Business")
    print("-" * 40)
    business = create_test_business()
    print()
    
    # 3. Create test business owner
    print("3. Test Business Owner")
    print("-" * 40)
    owner = create_test_business_owner(business)
    print()
    
    print("═" * 60)
    print("SEEDING COMPLETE")
    print("═" * 60)
    print("\nCredentials Summary:")
    print(f"  Super Admin:    {SUPER_ADMIN['email']} / {SUPER_ADMIN['password']}")
    print(f"  Business Owner: {TEST_BUSINESS_OWNER['email']} / {TEST_BUSINESS_OWNER['password']}")
    print(f"  Test Business:  {TEST_BUSINESS['subdomain']}.yourdomain.com")
    print()


if __name__ == '__main__':
    main()
else:
    # Running via exec() in manage.py shell
    main()
