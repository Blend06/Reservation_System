from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from api.models import Reservation, Business
from api.serializers import ReservationSerializer
from api.middleware import get_current_tenant
from api.utils.sms_utils import send_reservation_confirmation_sms, send_reservation_cancelled_sms, send_admin_notification_sms
from api.utils.email_utils import send_new_reservation_email
import logging

logger = logging.getLogger(__name__)


def get_tenant_from_request(request):
    """
    Resolve business (tenant) from subdomain sent by frontend.
    Used when API is on a different host (e.g. api.domain.com) so Host header
    doesn't contain the business subdomain.
    """
    subdomain = (
        request.META.get('HTTP_X_SUBDOMAIN') or
        request.data.get('subdomain')
    )
    if not subdomain:
        return None
    try:
        return Business.objects.get(subdomain=subdomain.strip().lower(), is_active=True)
    except (Business.DoesNotExist, Business.MultipleObjectsReturned):
        return None


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
                return Reservation.objects.all().order_by('-created_at')
            elif user.is_business_owner and user.business:
                # Business owner sees only their business reservations
                return Reservation.objects.filter(business=user.business).order_by('-created_at')
        
        # No access for unauthenticated users on main domain
        return Reservation.objects.none()

    def create(self, request, *args, **kwargs):
        """Remove subdomain from body before validation (used only to resolve tenant)."""
        data = request.data.copy() if request.data else {}
        data.pop('subdomain', None)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        """
        Create reservation with proper business context.
        Public (simple) clients can create without login when business is identified
        by subdomain (from Host header or X-Subdomain / body).
        """
        tenant = get_current_tenant() or get_tenant_from_request(self.request)

        if tenant:
            # Subdomain context or subdomain from frontend - no auth required
            reservation = serializer.save(business=tenant, status='pending')
            
            # Send email notification to business owner ONLY (not to customer yet)
            try:
                send_new_reservation_email(reservation)
                logger.info(f'✅ Email sent to business owner for reservation {reservation.id}')
            except Exception as e:
                logger.error(f'❌ Failed to send email for reservation {reservation.id}: {str(e)}')
            
            # DO NOT send SMS to customer on creation - only when BO confirms/rejects
        else:
            # Main domain, no subdomain - require authentication and business
            if not self.request.user.is_authenticated:
                from rest_framework.exceptions import ValidationError
                raise ValidationError("No business context found. Please use a valid booking link.")
            if self.request.user.is_business_owner and self.request.user.business:
                reservation = serializer.save(business=self.request.user.business)
                
                # Send email notification to business owner
                try:
                    send_new_reservation_email(reservation)
                    logger.info(f'✅ Email sent to business owner for reservation {reservation.id}')
                except Exception as e:
                    logger.error(f'❌ Failed to send email for reservation {reservation.id}: {str(e)}')
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
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Update reservation status and send WhatsApp notification to customer
        Returns detailed feedback about WhatsApp delivery status
        """
        reservation = self.get_object()
        new_status = request.data.get('status')
        
        # Validate status
        if new_status not in ['pending', 'confirmed', 'rejected', 'canceled']:
            return Response(
                {'error': 'Invalid status. Must be: pending, confirmed, rejected, or canceled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check permissions
        user = request.user
        if not user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not (user.is_super_admin or (user.is_business_owner and user.business == reservation.business)):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update status
        old_status = reservation.status
        reservation.status = new_status
        reservation.save()
        
        logger.info(f'📝 Reservation {reservation.id} status updated: {old_status} → {new_status}')
        
        # Send SMS notification for confirmed/rejected/canceled status
        sms_sent = False
        sms_error = None
        
        if new_status in ['confirmed', 'rejected', 'canceled']:
            try:
                # Send correct message based on status
                if new_status == 'confirmed':
                    sms_sent = send_reservation_confirmation_sms(reservation)
                elif new_status in ['rejected', 'canceled']:
                    sms_sent = send_reservation_cancelled_sms(reservation)
                
                if sms_sent:
                    logger.info(f'✅ SMS sent to {reservation.customer_phone} for reservation {reservation.id} (status: {new_status})')
                else:
                    logger.warning(f'⚠️ SMS not sent (Twilio not configured) for reservation {reservation.id}')
                    sms_error = 'Twilio SMS not configured'
                    
            except Exception as e:
                logger.error(f'❌ SMS failed for reservation {reservation.id}: {str(e)}')
                sms_error = str(e)
        
        # Prepare response with detailed feedback
        serializer = self.get_serializer(reservation)
        response_data = {
            'reservation': serializer.data,
            'status_updated': True,
            'old_status': old_status,
            'new_status': new_status,
            'sms_notification': {
                'sent': sms_sent,
                'required': new_status in ['confirmed', 'rejected', 'canceled'],
                'error': sms_error,
                'customer_phone': reservation.customer_phone
            }
        }
        
        return Response(response_data, status=status.HTTP_200_OK)