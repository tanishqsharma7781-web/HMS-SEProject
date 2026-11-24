from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import Visitor
from .serializers import VisitorSerializer
from users.permissions import IsSecurityOrStaff

class VisitorViewSet(viewsets.ModelViewSet):
    queryset = Visitor.objects.all().select_related('student__student_profile', 'registered_by')
    serializer_class = VisitorSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = [
        'visitor_name', 'visitor_phone', 'purpose',
        'student__username', 'student__first_name', 'student__last_name',
        'student__student_profile__student_id'
    ]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'mark_exit']:
            return [IsSecurityOrStaff()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'WARDEN', 'SECURITY'] or user.is_superuser:
            qs = super().get_queryset()
            status_param = self.request.query_params.get('status')
            if status_param:
                qs = qs.filter(status=status_param)
            return qs
        elif user.role == 'STUDENT':
            return super().get_queryset().filter(student=user)
        return Visitor.objects.none()

    def perform_create(self, serializer):
        serializer.save(registered_by=self.request.user, status='INSIDE')

    @action(detail=True, methods=['post'])
    def mark_exit(self, request, pk=None):
        visitor = self.get_object()
        if visitor.status == 'EXITED':
            return Response({'error': 'Visitor has already exited.'}, status=status.HTTP_400_BAD_REQUEST)
        
        visitor.status = 'EXITED'
        visitor.exit_time = timezone.now()
        visitor.remarks = request.data.get('remarks', visitor.remarks)
        visitor.save()

        return Response({
            'message': f"Visitor {visitor.visitor_name} exit recorded.",
            'visitor': VisitorSerializer(visitor).data
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        today_date = timezone.localdate()
        today_visitors = Visitor.objects.filter(entry_time__date=today_date)
        currently_inside = Visitor.objects.filter(status='INSIDE')

        return Response({
            'today_total': today_visitors.count(),
            'currently_inside': currently_inside.count(),
            'today_exited': today_visitors.filter(status='EXITED').count(),
            'all_time_total': Visitor.objects.count()
        })
