from rest_framework import serializers
from api.models import Business

class BusinessSerializer(serializers.ModelSerializer):
    full_domain = serializers.ReadOnlyField()
    admin_email = serializers.ReadOnlyField()
    
    class Meta:
        model = Business
        fields = [
            'id', 'name', 'subdomain', 'email', 'phone',
            'business_hours_start', 'business_hours_end', 'timezone',
            'email_from_name', 'email_from_address',
            'primary_color', 'logo_url',
            'is_active', 'subscription_status', 'subscription_expires',
            'created_at', 'updated_at',
            'full_domain', 'admin_email'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_subdomain(self, value):
        """Validate subdomain format and uniqueness"""
        if not value:
            raise serializers.ValidationError("Subdomain is required")
        
        # Check if subdomain is already taken (excluding current instance)
        queryset = Business.objects.filter(subdomain=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError("This subdomain is already taken")
        
        return value.lower()

class BusinessCreateSerializer(BusinessSerializer):
    """Serializer for creating new businesses"""
    
    class Meta(BusinessSerializer.Meta):
        fields = [
            'name', 'subdomain', 'email', 'phone',
            'business_hours_start', 'business_hours_end', 'timezone',
            'email_from_name', 'email_from_address',
            'primary_color', 'logo_url'
        ]

class BusinessListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing businesses"""
    
    full_domain = serializers.ReadOnlyField()
    user_count = serializers.SerializerMethodField()
    reservation_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Business
        fields = [
            'id', 'name', 'subdomain', 'full_domain', 'email',
            'is_active', 'subscription_status', 'created_at',
            'user_count', 'reservation_count'
        ]
    
    def get_user_count(self, obj):
        return obj.users.count()
    
    def get_reservation_count(self, obj):
        return obj.reservations.count()