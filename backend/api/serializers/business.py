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
            'primary_color', 'logo', 'logo_url',
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
    
    def validate_logo(self, value):
        """Validate logo file is PNG and size"""
        if value:
            # Check file extension
            if not value.name.lower().endswith('.png'):
                raise serializers.ValidationError("Only PNG files are allowed")
            
            # Check file size (max 2MB)
            if value.size > 2 * 1024 * 1024:
                raise serializers.ValidationError("Logo file size must be less than 2MB")
        
        return value

class BusinessCreateSerializer(BusinessSerializer):
    """Serializer for creating new businesses with owner account"""
    owner_email = serializers.EmailField(write_only=True, required=True)
    owner_password = serializers.CharField(write_only=True, required=True, min_length=8)
    owner_first_name = serializers.CharField(write_only=True, required=True)
    owner_last_name = serializers.CharField(write_only=True, required=True)
    
    class Meta(BusinessSerializer.Meta):
        fields = [
            'name', 'subdomain', 'email', 'phone',
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
    
    class Meta:
        model = Business
        fields = [
            'id', 'name', 'subdomain', 'full_domain',
            'email', 'phone',
            'business_hours_start', 'business_hours_end', 'timezone',
            'email_from_name', 'email_from_address', 'admin_email',
            'primary_color', 'logo_url',
            'is_active', 'subscription_status', 'subscription_expires',
            'created_at', 'updated_at',
            'user_count', 'reservation_count'
        ]
    
    def get_user_count(self, obj):
        return obj.users.count()
    
    def get_reservation_count(self, obj):
        return obj.reservations.count()