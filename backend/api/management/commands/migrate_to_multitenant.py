from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import User, Business, Reservation
import uuid

class Command(BaseCommand):
    help = 'Migrate existing single-tenant data to multi-tenant structure'

    def add_arguments(self, parser):
        parser.add_argument(
            '--business-name',
            type=str,
            default='Default Business',
            help='Name for the default business'
        )
        parser.add_argument(
            '--subdomain',
            type=str,
            default='default',
            help='Subdomain for the default business'
        )

    def handle(self, *args, **options):
        business_name = options['business_name']
        subdomain = options['subdomain']
        
        self.stdout.write(
            self.style.SUCCESS(f'Starting migration to multi-tenant structure...')
        )
        
        try:
            with transaction.atomic():
                # Create default business
                business, created = Business.objects.get_or_create(
                    subdomain=subdomain,
                    defaults={
                        'name': business_name,
                        'email': 'admin@example.com',  # Update this
                        'email_from_name': business_name,
                        'is_active': True,
                    }
                )
                
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f'Created business: {business.name}')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(f'Business already exists: {business.name}')
                    )
                
                # Update existing users
                users_updated = 0
                for user in User.objects.filter(business__isnull=True):
                    if user.user_type == 'business_owner':
                        user.business = business
                        user.save()
                        users_updated += 1
                
                self.stdout.write(
                    self.style.SUCCESS(f'Updated {users_updated} users with business relationship')
                )
                
                # Migrate existing reservations
                reservations_updated = 0
                for reservation in Reservation.objects.filter(business__isnull=True):
                    # Set business
                    reservation.business = business
                    
                    # Migrate customer data from User to direct fields
                    if reservation.customer and not reservation.customer_name:
                        reservation.customer_name = reservation.customer.get_full_name()
                        reservation.customer_email = reservation.customer.email
                        reservation.customer_phone = reservation.customer.phone
                    
                    reservation.save()
                    reservations_updated += 1
                
                self.stdout.write(
                    self.style.SUCCESS(f'Updated {reservations_updated} reservations')
                )
                
                self.stdout.write(
                    self.style.SUCCESS('Migration completed successfully!')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Migration failed: {str(e)}')
            )
            raise