from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.db.models import Count, Q
from django.contrib.auth import get_user_model
from .models import Attendance
from .serializers import AttendanceSerializer
from users.permissions import IsAdminOrWarden

User = get_user_model()

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().select_related('student__student_profile', 'marked_by')
    serializer_class = AttendanceSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['student__username', 'student__first_name', 'student__last_name', 'student__student_profile__student_id']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'bulk_mark']:
            return [IsAdminOrWarden()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'WARDEN'] or user.is_superuser:
            qs = super().get_queryset()
            date_param = self.request.query_params.get('date')
            if date_param:
                qs = qs.filter(date=date_param)
            status_param = self.request.query_params.get('status')
            if status_param:
                qs = qs.filter(status=status_param)
            return qs
        elif user.role == 'STUDENT':
            return super().get_queryset().filter(student=user)
        return Attendance.objects.none()

    def perform_create(self, serializer):
        serializer.save(marked_by=self.request.user)

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        date_str = request.data.get('date', str(timezone.localdate()))
        records = request.data.get('records', [])
        
        if not records or not isinstance(records, list):
            return Response({'error': 'List of student records required.'}, status=status.HTTP_400_BAD_REQUEST)

        marked_count = 0
        for item in records:
            student_id = item.get('student') or item.get('student_id')
            attend_status = item.get('status', 'PRESENT')
            remarks = item.get('remarks', '')

            try:
                student = User.objects.get(id=student_id, role='STUDENT')
                Attendance.objects.update_or_create(
                    student=student,
                    date=date_str,
                    defaults={
                        'status': attend_status,
                        'marked_by': request.user,
                        'remarks': remarks
                    }
                )
                marked_count += 1
            except User.DoesNotExist:
                continue

        return Response({
            'message': f"Successfully recorded attendance for {marked_count} students on {date_str}.",
            'date': date_str,
            'count': marked_count
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user
        if user.role == 'STUDENT':
            base_qs = Attendance.objects.filter(student=user)
        else:
            base_qs = Attendance.objects.all()

        date_param = request.query_params.get('date')
        if date_param:
            base_qs = base_qs.filter(date=date_param)

        total = base_qs.count()
        present = base_qs.filter(status='PRESENT').count()
        absent = base_qs.filter(status='ABSENT').count()
        on_leave = base_qs.filter(status='ON_LEAVE').count()
        percentage = round((present / total * 100), 1) if total > 0 else 100.0

        return Response({
            'total': total,
            'present': present,
            'absent': absent,
            'on_leave': on_leave,
            'percentage': percentage
        })
