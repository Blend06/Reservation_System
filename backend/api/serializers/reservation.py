from rest_framework import serializers
from api.models import Reservation, Business
from api.serializers.user import UserSerializer
from api.utils.input_sanitizer import InputSanitizer

class ReservationSerializer(serializers.ModelSerializer):
    customer_details = UserSerializer(source='customer', read_only=True)
    business_name = serializers.CharField(source='business.name', read_only=True)
    business_subdomain = serializers.CharField(source='business.subdomain', read_only=True)
    business_id = serializers.IntegerField(source='business.id', read_only=True)
    customer_name_display = serializers.CharField(source='customer_display_name', read_only=True)
    customer_email_display = serializers.CharField(source='customer_display_email', read_only=True)
    staff_name = serializers.CharField(source='staff.name', read_only=True, default=None)

    class Meta:
        model = Reservation
        fields = [
            'id', 'business', 'business_id', 'business_name', 'business_subdomain',
            'customer_name', 'customer_email', 'customer_phone',
            'customer_name_display', 'customer_email_display',
            'start_time', 'end_time', 'status', 'notes',
            'staff', 'staff_name',
            'created_at', 'updated_at',
            'customer', 'customer_details'
        ]
        read_only_fields = ['created_at', 'updated_at', 'business']
    
    def validate_customer_name(self, value):
        """Validate and sanitize customer name"""
        return InputSanitizer.sanitize_name(value, max_length=100)
    
    def validate_customer_phone(self, value):
        """Validate and sanitize phone number"""
        return InputSanitizer.sanitize_phone(value)
    
    def validate_customer_email(self, value):
        """Validate and sanitize email (optional field)"""
        if value:
            return InputSanitizer.sanitize_email(value)
        return value
    
    def validate_notes(self, value):
        """Sanitize notes to prevent XSS"""
        if value:
            return InputSanitizer.sanitize_text(value, max_length=1000)
        return value
    
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
            'customer_name', 'customer_phone',
            'start_time', 'end_time', 'notes', 'staff'
        ]
    
    def validate_customer_name(self, value):
        """Validate and sanitize customer name"""
        return InputSanitizer.sanitize_name(value, max_length=100)
    
    def validate_customer_phone(self, value):
        """Validate and sanitize phone number"""
        return InputSanitizer.sanitize_phone(value)
    
    def validate_notes(self, value):
        """Sanitize notes to prevent XSS"""
        if value:
            return InputSanitizer.sanitize_text(value, max_length=1000)
        return value

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