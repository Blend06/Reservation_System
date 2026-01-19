from rest_framework import serializers
from api.models import Reservation, Business
from api.serializers.user import UserSerializer

class ReservationSerializer(serializers.ModelSerializer):
    # Read-only fields for display
    customer_details = UserSerializer(source='customer', read_only=True)
    business_name = serializers.CharField(source='business.name', read_only=True)
    business_subdomain = serializers.CharField(source='business.subdomain', read_only=True)
    
    # Use customer_display_name and customer_display_email properties
    customer_name_display = serializers.CharField(source='customer_display_name', read_only=True)
    customer_email_display = serializers.CharField(source='customer_display_email', read_only=True)
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'business', 'business_name', 'business_subdomain',
            'customer_name', 'customer_email', 'customer_phone',
            'customer_name_display', 'customer_email_display',
            'start_time', 'end_time', 'status', 'notes',
            'created_at', 'updated_at',
            'customer', 'customer_details'  # Legacy fields
        ]
        read_only_fields = ['created_at', 'updated_at', 'business']
    
    def validate(self, data):
        """Validate reservation data"""
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        if start_time and end_time:
            if start_time >= end_time:
                raise serializers.ValidationError(
                    "End time must be after start time"
                )
        
        return data

class PublicReservationSerializer(serializers.ModelSerializer):
    """
    Serializer for public reservation creation (subdomain context)
    Only includes fields needed for public booking
    """
    
    class Meta:
        model = Reservation
        fields = [
            'customer_name', 'customer_email', 'customer_phone',
            'start_time', 'end_time', 'notes'
        ]
    
    def validate_customer_email(self, value):
        """Validate email format"""
        if not value:
            raise serializers.ValidationError("Email is required")
        return value.lower()
    
    def validate_customer_name(self, value):
        """Validate customer name"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Valid name is required")
        return value.strip()

class ReservationListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing reservations
    """
    customer_name_display = serializers.CharField(source='customer_display_name', read_only=True)
    customer_email_display = serializers.CharField(source='customer_display_email', read_only=True)
    business_name = serializers.CharField(source='business.name', read_only=True)
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'customer_name_display', 'customer_email_display',
            'start_time', 'end_time', 'status', 'business_name',
            'created_at'
        ]