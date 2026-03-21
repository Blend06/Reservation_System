"""
Test: Send reservation notification email with dummy data
Run from backend directory:
    docker compose cp ../scripts/tests/test_email.py backend:/app/test_email.py
    docker compose exec backend python test_email.py
"""
import os, sys, django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from datetime import datetime

TO_EMAIL = 'bkqiku31@gmail.com'

html_message = render_to_string('new_reservation_admin.html', {
    'customer_name': 'John Doe',
    'customer_phone': '+383 44 111 111',
    'customer_email': '',
    'reservation_id': 'TEST-001',
    'reservation_date': datetime.now().strftime('%d/%m/%Y'),
    'reservation_time': '14:00',
    'business_name': 'Fade District',
})

result = send_mail(
    subject='Rezervim i Ri #TEST-001 - Fade District',
    message='',
    from_email=settings.DEFAULT_FROM_EMAIL,
    recipient_list=[TO_EMAIL],
    html_message=html_message,
    fail_silently=False,
)

if result:
    print(f'✅ Email sent successfully to {TO_EMAIL}')
else:
    print(f'❌ Email failed to send')
