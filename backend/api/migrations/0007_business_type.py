from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_staff_reservation_staff'),
    ]

    operations = [
        migrations.AddField(
            model_name='business',
            name='business_type',
            field=models.CharField(
                choices=[
                    ('barbershop', 'Barbershop'),
                    ('salon', 'Salon'),
                    ('spa', 'Spa'),
                    ('restaurant', 'Restaurant'),
                    ('fitness', 'Fitness'),
                    ('clinic', 'Clinic'),
                    ('other', 'Other'),
                ],
                default='other',
                help_text='Type of business',
                max_length=20,
            ),
        ),
    ]
