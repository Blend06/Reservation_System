from rest_framework import serializers
from api.models import Reservation
from api.serializers.user import UserSerializer

class ReservationSerializer(serializers.ModelSerializer):
    customer_details = UserSerializer(source='customer', read_only=True)
    customer_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Reservation
        fields = "__all__"
        read_only_fields = ["customer", "created_at"]
    
    def get_customer_name(self, obj):
        """Return customer's full name or username"""
        if obj.customer.first_name and obj.customer.last_name:
            return f"{obj.customer.first_name} {obj.customer.last_name}"
        return obj.customer.username