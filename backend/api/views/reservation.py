from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.models import Reservation, Business
from api.serializers import ReservationSerializer
from api.middleware import get_current_tenant

class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = []  # No authentication required for public booking

    def get_queryset(self):
        """
        Get reservations based on context:
        - Subdomain context: All reservations for that business (public view)
        - Main domain + super admin: All reservations across all businesses
        - Main domain + business owner: Only their business reservations
        """
        user = self.request.user
        tenant = get_current_tenant()
        
        if tenant:
            # Subdomain context - return reservations for this business only
            return Reservation.objects.filter(business=tenant).order_by('-created_at')
        
        # Main domain context
        if user.is_authenticated:
            if user.is_super_admin:
                # Super admin sees all reservations
                return Reservation.all_objects.all().order_by('-created_at')
            elif user.is_business_owner and user.business:
                # Business owner sees only their business reservations
                return Reservation.objects.filter(business=user.business).order_by('-created_at')
        
        # No access for unauthenticated users on main domain
        return Reservation.objects.none()

    def perform_create(self, serializer):
        """
        Create reservation with proper business context
        """
        tenant = get_current_tenant()
        
        if tenant:
            # Subdomain context - create reservation for this business
            serializer.save(business=tenant, status='pending')
        else:
            # Main domain context - require authentication and business
            if not self.request.user.is_authenticated:
                raise PermissionError("Authentication required")
            
            if self.request.user.is_business_owner and self.request.user.business:
                serializer.save(business=self.request.user.business)
            else:
                raise PermissionError("No business context available")

    def perform_update(self, serializer):
        """
        Update reservation with permission checks
        """
        user = self.request.user
        tenant = get_current_tenant()
        reservation = self.get_object()
        
        # Check permissions
        if tenant:
            # Subdomain context - no updates allowed for public users
            raise PermissionError("Updates not allowed in public context")
        
        if not user.is_authenticated:
            raise PermissionError("Authentication required")
        
        if user.is_super_admin:
            # Super admin can update any reservation
            serializer.save()
        elif user.is_business_owner and user.business == reservation.business:
            # Business owner can update their business reservations
            serializer.save()
        else:
            raise PermissionError("Permission denied")

    def perform_destroy(self, instance):
        """
        Delete reservation with permission checks
        """
        user = self.request.user
        tenant = get_current_tenant()
        
        # Check permissions
        if tenant:
            # Subdomain context - no deletes allowed for public users
            raise PermissionError("Deletes not allowed in public context")
        
        if not user.is_authenticated:
            raise PermissionError("Authentication required")
        
        if user.is_super_admin:
            # Super admin can delete any reservation
            instance.delete()
        elif user.is_business_owner and user.business == instance.business:
            # Business owner can delete their business reservations
            instance.delete()
        else:
            raise PermissionError("Permission denied")

    @action(detail=False, methods=['post'], permission_classes=[])
    def lookup(self, request):
        """Allow customers to look up their reservations by phone number"""
        phone = request.data.get('phone')
        tenant = get_current_tenant()
        
        if not phone:
            return Response(
                {'error': 'Phone number is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not tenant:
            return Response(
                {'error': 'Business context required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reservations = Reservation.objects.filter(
            business=tenant,
            customer_phone=phone
        ).order_by('-created_at')
        
        serializer = self.get_serializer(reservations, many=True)
        return Response({
            'reservations': serializer.data,
            'business_name': tenant.name
        })