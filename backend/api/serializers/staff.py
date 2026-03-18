from rest_framework import serializers
from api.models import Staff

class StaffSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source='business.name', read_only=True)

    class Meta:
        model = Staff
        fields = ['id', 'name', 'business_name', 'rest_days', 'is_active', 'created_at']
        read_only_fields = ['created_at']
