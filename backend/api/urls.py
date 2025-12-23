from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import RegisterView, ReservationViewSet, UserViewSet

router = DefaultRouter()
router.register(r"reservations", ReservationViewSet, basename="reservation")
router.register(r"users", UserViewSet, basename="user")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("", include(router.urls)),
]