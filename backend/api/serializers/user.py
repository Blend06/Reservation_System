from rest_framework import serializers
from api.models import User


class BusinessMinimalSerializer(serializers.Serializer):
    """Minimal business info for user list"""
    id = serializers.UUIDField(read_only=True)
    name = serializers.CharField(read_only=True)
    subdomain = serializers.CharField(read_only=True)
    full_domain = serializers.ReadOnlyField()
    logo_url = serializers.CharField(read_only=True)
    logo = serializers.SerializerMethodField()

    def get_logo(self, obj):
        request = self.context.get('request')
        if obj.logo:
            url = obj.logo.url
            return request.build_absolute_uri(url) if request else url
        return None


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for public registration — only safe fields are writable."""
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "phone", "password"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


PRIVILEGED_FIELDS = {"user_type", "is_staff", "business", "is_active"}


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    is_staff_member = serializers.BooleanField(source='is_staff', required=False)
    is_super_admin = serializers.BooleanField(read_only=True)
    is_business_owner = serializers.BooleanField(read_only=True)
    business_details = BusinessMinimalSerializer(source='business', read_only=True)

    def get_fields(self):
        fields = super().get_fields()
        # Pass request context to nested serializer
        request = self.context.get('request')
        if request:
            fields['business_details'].context['request'] = request
        return fields

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name", "phone",
            "password", "user_type", "business", "business_details",
            "is_admin", "is_super_admin", "is_business_owner", "is_staff_member", "is_active",
            "created_at", "updated_at", "last_login"
        ]
        read_only_fields = ["created_at", "updated_at", "last_login"]

    def _strip_privileged_fields(self, data):
        request = self.context.get("request")
        if not request or not getattr(request.user, "is_admin", False):
            for field in PRIVILEGED_FIELDS:
                data.pop(field, None)
        return data

    def create(self, validated_data):
        validated_data = self._strip_privileged_fields(validated_data)
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
        validated_data = self._strip_privileged_fields(validated_data)
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
