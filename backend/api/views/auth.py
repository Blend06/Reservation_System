from rest_framework import generics, permissions
from api.serializers import UserSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_class = [permissions.AllowAny]