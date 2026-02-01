from django.contrib import admin
from .models import User, Reservation, Business

# Register your models here.

@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = ['name', 'subdomain', 'email', 'is_active', 'subscription_status', 'created_at']
    list_filter = ['is_active', 'subscription_status', 'created_at']
    search_fields = ['name', 'subdomain', 'email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'subdomain', 'email', 'phone')
        }),
        ('Business Settings', {
            'fields': ('business_hours_start', 'business_hours_end', 'timezone')
        }),
        ('Email Configuration', {
            'fields': ('email_from_name', 'email_from_address')
        }),
        ('Branding', {
            'fields': ('primary_color', 'logo_url')
        }),
        ('Status & Subscription', {
            'fields': ('is_active', 'subscription_status', 'subscription_expires')
        }),
        ('System Info', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'first_name', 'last_name', 'user_type', 'business', 'is_active', 'created_at']
    list_filter = ['user_type', 'is_active', 'business', 'created_at']
    search_fields = ['email', 'first_name', 'last_name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_login']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('email', 'first_name', 'last_name', 'phone')
        }),
        ('Account Settings', {
            'fields': ('user_type', 'business', 'is_active', 'is_staff')
        }),
        ('System Info', {
            'fields': ('id', 'created_at', 'updated_at', 'last_login'),
            'classes': ('collapse',)
        })
    )
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Filter business choices based on user type
        if 'business' in form.base_fields:
            if obj and obj.user_type == 'super_admin':
                form.base_fields['business'].queryset = Business.objects.none()
                form.base_fields['business'].help_text = "Super admins don't belong to any business"
            else:
                form.base_fields['business'].queryset = Business.objects.filter(is_active=True)
        return form

admin.site.register(Reservation)
