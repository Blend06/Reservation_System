from rest_framework import serializers
from api.models import User


class BusinessMinimalSerializer(serializers.Serializer):
    """Minimal business info for user list"""
    id = serializers.UUIDField(read_only=True)
    name = serializers.CharField(read_only=True)
    subdomain = serializers.CharField(read_only=True)


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    is_staff_member = serializers.BooleanField(source='is_staff', required=False)
    is_super_admin = serializers.BooleanField(read_only=True)
    is_business_owner = serializers.BooleanField(read_only=True)
    business_details = BusinessMinimalSerializer(source='business', read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name", "phone",
            "password", "user_type", "business", "business_details",
            "is_admin", "is_super_admin", "is_business_owner", "is_staff_member", "is_active",
            "created_at", "updated_at", "last_login"
        ]
        read_only_fields = ["created_at", "updated_at", "last_login"]

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        validated_data.pop("business_details", None)
        if 'is_staff' in validated_data:
            validated_data['is_staff'] = validated_data.pop('is_staff')
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        validated_data.pop("business_details", None)
        if 'is_staff' in validated_data:
            validated_data['is_staff'] = validated_data.pop('is_staff')
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
