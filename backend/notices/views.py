from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import Notice, Notification
from .serializers import NoticeSerializer, NotificationSerializer
from users.permissions import IsAdminOrWarden

class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all().select_related('published_by')
    serializer_class = NoticeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content', 'target_role', 'priority']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrWarden()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'WARDEN'] or user.is_superuser:
            return super().get_queryset()
        
        # Filter for non-admin/warden: published notices for ALL or user role
        return super().get_queryset().filter(
            is_published=True
        ).filter(
            Q(target_role='ALL') | Q(target_role=user.role)
        )

    def perform_create(self, serializer):
        serializer.save(published_by=self.request.user)


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read.'})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save(update_fields=['is_read'])
        return Response({'message': 'Notification marked as read.'})
