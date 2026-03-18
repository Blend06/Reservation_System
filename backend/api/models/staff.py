from django.db import models

DAYS_OF_WEEK = [
    (0, 'E Hënë'),
    (1, 'E Martë'),
    (2, 'E Mërkurë'),
    (3, 'E Enjte'),
    (4, 'E Premte'),
    (5, 'E Shtunë'),
    (6, 'E Diel'),
]

class Staff(models.Model):
    business = models.ForeignKey(
        'Business',
        on_delete=models.CASCADE,
        related_name='staff_members'
    )
    name = models.CharField(max_length=100)
    rest_days = models.JSONField(
        default=list,
        blank=True,
        help_text="List of day integers (0=Mon, 6=Sun) when this staff member doesn't work"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.business.name})"
