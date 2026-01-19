from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from api.models import Business, User, Reservation
from api.serializers import BusinessSerializer, BusinessCreateSerializer, BusinessListSerializer

class BusinessViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing businesses (Super Admin only)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only super admins can access business management
        if not self.request.user.is_super_admin:
            return Business.objects.none()
        return Business.objects.all().order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BusinessListSerializer
        elif self.action == 'create':
            return BusinessCreateSerializer
        return BusinessSerializer
    
    def perform_create(self, serializer):
        """Create a new business"""
        if not self.request.user.is_super_admin:
            raise permissions.PermissionDenied("Only super admins can create businesses")
        serializer.save()
    
    def perform_update(self, serializer):
        """Update business"""
        if not self.request.user.is_super_admin:
            raise permissions.PermissionDenied("Only super admins can update businesses")
        serializer.save()
    
    def perform_destroy(self, instance):
        """Soft delete business by deactivating it"""
        if not self.request.user.is_super_admin:
            raise permissions.PermissionDenied("Only super admins can delete businesses")
        instance.is_active = False
        instance.save()
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a business"""
        if not request.user.is_super_admin:
            return Response(
                {"error": "Permission denied"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        business = self.get_object()
        business.is_active = True
        business.save()
        
        return Response({"message": "Business activated successfully"})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a business"""
        if not request.user.is_super_admin:
            return Response(
                {"error": "Permission denied"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        business = self.get_object()
        business.is_active = False
        business.save()
        
        return Response({"message": "Business deactivated successfully"})
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get business statistics"""
        if not request.user.is_super_admin:
            return Response(
                {"error": "Permission denied"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        business = self.get_object()
        
        # Calculate date ranges
        now = timezone.now()
        last_30_days = now - timedelta(days=30)
        last_7_days = now - timedelta(days=7)
        
        # Get statistics
        stats = {
            'total_users': business.users.count(),
            'total_reservations': business.reservations.count(),
            'pending_reservations': business.reservations.filter(status='pending').count(),
            'confirmed_reservations': business.reservations.filter(status='confirmed').count(),
            'reservations_last_30_days': business.reservations.filter(
                created_at__gte=last_30_days
            ).count(),
            'reservations_last_7_days': business.reservations.filter(
                created_at__gte=last_7_days
            ).count(),
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get overall dashboard statistics for super admin"""
        if not request.user.is_super_admin:
            return Response(
                {"error": "Permission denied"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Calculate date ranges
        now = timezone.now()
        last_30_days = now - timedelta(days=30)
        
        stats = {
            'total_businesses': Business.objects.count(),
            'active_businesses': Business.objects.filter(is_active=True).count(),
            'total_users': User.objects.filter(user_type='business_owner').count(),
            'total_reservations': Reservation.objects.count(),
            'reservations_last_30_days': Reservation.objects.filter(
                created_at__gte=last_30_days
            ).count(),
            'businesses_by_status': {
                'active': Business.objects.filter(is_active=True).count(),
                'inactive': Business.objects.filter(is_active=False).count(),
            },
            'recent_businesses': BusinessListSerializer(
                Business.objects.order_by('-created_at')[:5], 
                many=True
            ).data
        }
        
        return Response(stats)