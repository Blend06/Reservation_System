from rest_framework import viewsets, permissions
from rest_framework.response import Response
from api.models import Staff, Business
from api.serializers import StaffSerializer


class StaffViewSet(viewsets.ModelViewSet):
    serializer_class = StaffSerializer

    def get_permissions(self):
        # Public GET (list by subdomain) requires no auth
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        subdomain = self.request.query_params.get('subdomain')
        business_id = self.request.query_params.get('business_id')

        # Public: filter by subdomain
        if subdomain:
            return Staff.objects.filter(
                business__subdomain=subdomain,
                business__is_active=True,
                is_active=True
            )

        user = self.request.user
        if not user.is_authenticated:
            return Staff.objects.none()

        # Superadmin: can query any business by business_id
        if user.is_super_admin and business_id:
            return Staff.objects.filter(business__id=business_id)

        # Business owner: sees their own staff
        if user.is_business_owner and user.business:
            return Staff.objects.filter(business=user.business)

        return Staff.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        business_id = self.request.data.get('business_id')

        # Superadmin can create staff for any business
        if user.is_super_admin and business_id:
            business = Business.objects.get(id=business_id)
            serializer.save(business=business)
            return

        if not (user.is_business_owner and user.business):
            raise permissions.PermissionDenied("Only business owners can manage staff")
        serializer.save(business=user.business)

    def perform_update(self, serializer):
        user = self.request.user
        if user.is_super_admin:
            serializer.save()
            return
        if self.get_object().business != user.business:
            raise permissions.PermissionDenied()
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user.is_super_admin:
            instance.delete()
            return
        if instance.business != user.business:
            raise permissions.PermissionDenied()
        instance.delete()
