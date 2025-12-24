from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from api.models import User, Reservation


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    if not request.user.is_admin:
        return Response({'error': 'Admin access required'}, status=403)
    
    total_users = User.objects.count()
    total_reservations = Reservation.objects.count()
    pending_reservations = Reservation.objects.filter(status='pending').count()
    
    return Response({
        'total_users': total_users,
        'total_reservations': total_reservations,
        'pending_reservations': pending_reservations
    })