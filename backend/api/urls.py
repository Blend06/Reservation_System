from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import RegisterView, MeView, ReservationViewSet, UserViewSet, dashboard_stats

router = DefaultRouter()
router.register(r"reservations", ReservationViewSet, basename="reservation")
router.register(r"users", UserViewSet, basename="user")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("dashboard/stats/", dashboard_stats, name="dashboard_stats"),
    path("", include(router.urls)),
]