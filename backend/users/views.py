from rest_framework import generics, viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db.models import Q

from .models import StudentProfile, WardenProfile, SecurityProfile
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    StudentProfileSerializer,
    StudentRegistrationSerializer,
    WardenRegistrationSerializer,
    SecurityRegistrationSerializer,
    ChangePasswordSerializer
)
from .permissions import IsAdminUser, IsAdminOrWarden

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CurrentUserView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.phone = request.data.get('phone', user.phone)
        user.save()

        # Update profile safe fields
        if user.role == 'STUDENT' and hasattr(user, 'student_profile'):
            sp = user.student_profile
            sp.emergency_contact = request.data.get('emergency_contact', sp.emergency_contact)
            sp.address = request.data.get('address', sp.address)
            sp.blood_group = request.data.get('blood_group', sp.blood_group)
            sp.parent_phone = request.data.get('parent_phone', sp.parent_phone)
            sp.save()
        elif user.role == 'WARDEN' and hasattr(user, 'warden_profile'):
            wp = user.warden_profile
            wp.qualification = request.data.get('qualification', wp.qualification)
            wp.emergency_contact = request.data.get('emergency_contact', wp.emergency_contact)
            wp.save()

        return Response(UserSerializer(user).data)


class ChangePasswordView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'old_password': ['Wrong password.']}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)


class StudentViewSet(viewsets.ModelViewSet):
    filter_backends = [filters.SearchFilter]
    search_fields = [
        'username', 'first_name', 'last_name', 'email', 'phone',
        'student_profile__student_id', 'student_profile__department', 'student_profile__course'
    ]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrWarden()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return StudentRegistrationSerializer
        return UserSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'WARDEN'] or user.is_superuser:
            qs = User.objects.filter(role='STUDENT').select_related('student_profile').order_by('-date_joined')
            # Optional query filters
            dept = self.request.query_params.get('department')
            if dept:
                qs = qs.filter(student_profile__department__icontains=dept)
            gender = self.request.query_params.get('gender')
            if gender:
                qs = qs.filter(student_profile__gender=gender)
            return qs
        elif user.role == 'STUDENT':
            return User.objects.filter(id=user.id, role='STUDENT').order_by('-date_joined')
        return User.objects.none()


class WardenViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email', 'warden_profile__employee_id']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAdminOrWarden()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return WardenRegistrationSerializer
        return UserSerializer

    def get_queryset(self):
        return User.objects.filter(role='WARDEN').select_related('warden_profile')


class SecurityViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'first_name', 'last_name', 'security_profile__employee_id']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SecurityRegistrationSerializer
        return UserSerializer

    def get_queryset(self):
        return User.objects.filter(role='SECURITY').select_related('security_profile')


class SystemUserViewSet(viewsets.ModelViewSet):
    """Admin-only view for system settings / user accounts overview"""
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all().order_by('-date_joined')
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email', 'role']

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        if user == request.user:
            return Response({'error': 'Cannot deactivate own account'}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = not user.is_active
        user.save()
        return Response({
            'message': f"User account {'activated' if user.is_active else 'deactivated'} successfully.",
            'is_active': user.is_active
        })
