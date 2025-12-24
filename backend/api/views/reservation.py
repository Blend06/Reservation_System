from rest_framework import viewsets
from api.models import Reservation
from api.serializers import ReservationSerializer


class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer

    def get_queryset(self):
        # Admin users can see all reservations, regular users only see their own
        if self.request.user.is_admin:
            return Reservation.objects.all().order_by('-created_at')
        return Reservation.objects.filter(customer=self.request.user).order_by('-created_at')[:10]

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)