from django.conf import settings
from rest_framework import serializers
from api.models import Business
from api.utils.input_sanitizer import InputSanitizer

_LOGO_MAX_BYTES = getattr(settings, 'LOGO_MAX_FILE_SIZE', 10 * 1024 * 1024)

class BusinessSerializer(serializers.ModelSerializer):
    full_domain = serializers.ReadOnlyField()
    admin_email = serializers.ReadOnlyField()
    
    class Meta:
        model = Business
        fields = [
            'id', 'name', 'subdomain', 'email', 'phone',
            'business_type',
            'business_hours_start', 'business_hours_end', 'timezone',
            'email_from_name', 'email_from_address',
            'primary_color', 'logo', 'logo_url',
            'is_active', 'subscription_status', 'subscription_expires',
            'created_at', 'updated_at',
            'full_domain', 'admin_email'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_name(self, value):
        """Validate and sanitize business name"""
        return InputSanitizer.sanitize_name(value, max_length=200)
    
    def validate_subdomain(self, value):
        """Validate subdomain format and uniqueness"""
        # Sanitize and validate format
        value = InputSanitizer.sanitize_subdomain(value)
        
        # Check if subdomain is already taken (excluding current instance)
        queryset = Business.objects.filter(subdomain=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError("This subdomain is already taken")
        
        return value
    
    def validate_email(self, value):
        """Validate business email"""
        return InputSanitizer.sanitize_email(value)
    
    def validate_phone(self, value):
        """Validate business phone"""
        if value:
            return InputSanitizer.sanitize_phone(value)
        return value
    
    def validate_email_from_name(self, value):
        """Sanitize email from name"""
        if value:
            return InputSanitizer.sanitize_text(value, max_length=100)
        return value
    
    def validate_logo(self, value):
        """Validate logo file is PNG & JPG and size"""
        if value:
            if not value.name.lower().endswith(('.png', '.jpg', '.jpeg')):
                raise serializers.ValidationError("Only PNG and JPG files are allowed")
            if value.size > _LOGO_MAX_BYTES:
                mb = _LOGO_MAX_BYTES // (1024 * 1024)
                raise serializers.ValidationError(f"Logo file size must be less than {mb}MB")
        return value

    def validate(self, data):
        # If a file is uploaded, clear logo_url — and vice versa — so they don't conflict
        if data.get('logo'):
            data['logo_url'] = ''
        elif data.get('logo_url'):
            data['logo'] = None
        return data

class BusinessCreateSerializer(BusinessSerializer):
    """Serializer for creating new businesses with owner account"""
    owner_email = serializers.EmailField(write_only=True, required=True)
    owner_password = serializers.CharField(write_only=True, required=True, min_length=8)
    owner_first_name = serializers.CharField(write_only=True, required=True)
    owner_last_name = serializers.CharField(write_only=True, required=True)
    
    class Meta(BusinessSerializer.Meta):
        fields = [
            'name', 'subdomain', 'email', 'phone',
            'business_type',
            'business_hours_start', 'business_hours_end', 'timezone',
            'email_from_name', 'email_from_address',
            'primary_color', 'logo', 'logo_url',
            'owner_email', 'owner_password', 'owner_first_name', 'owner_last_name'
        ]
    
    def create(self, validated_data):
        # Extract owner data
        owner_email = validated_data.pop('owner_email')
        owner_password = validated_data.pop('owner_password')
        owner_first_name = validated_data.pop('owner_first_name')
        owner_last_name = validated_data.pop('owner_last_name')
        
        # Create business
        business = Business.objects.create(**validated_data)
        
        # Create business owner user
        from api.models import User
        owner = User.objects.create_user(
            email=owner_email,
            password=owner_password,
            first_name=owner_first_name,
            last_name=owner_last_name,
            user_type='business_owner',
            business=business
        )
        
        return business

class BusinessListSerializer(serializers.ModelSerializer):
    """Full serializer for listing businesses (all attributes for dashboard table)"""
    
    full_domain = serializers.ReadOnlyField()
    admin_email = serializers.ReadOnlyField()
    user_count = serializers.SerializerMethodField()
    reservation_count = serializers.SerializerMethodField()
    owner_email = serializers.SerializerMethodField()
    logo = serializers.SerializerMethodField()

    def get_logo(self, obj):
        request = self.context.get('request')
        if obj.logo:
            url = obj.logo.url
            return request.build_absolute_uri(url) if request else url
        return obj.logo_url or None
    
    class Meta:
        model = Business
        fields = [
            'id', 'name', 'subdomain', 'full_domain',
            'email', 'phone',
            'business_type',
            'business_hours_start', 'business_hours_end', 'timezone',
            'email_from_name', 'email_from_address', 'admin_email',
            'primary_color', 'logo', 'logo_url',
            'is_active', 'subscription_status', 'subscription_expires',
            'created_at', 'updated_at',
            'user_count', 'reservation_count', 'owner_email'
        ]
    
    def get_user_count(self, obj):
        return obj.users.count()
    
    def get_reservation_count(self, obj):
        return obj.reservations.count()

    def get_owner_email(self, obj):
        owner = obj.users.filter(user_type='business_owner').first()
        return owner.email if owner else None