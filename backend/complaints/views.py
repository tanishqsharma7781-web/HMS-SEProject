from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from django.db.models import Count
from .models import Complaint, ComplaintAssignment
from .serializers import ComplaintSerializer
from users.permissions import IsAdminOrWarden

User = get_user_model()

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all().select_related(
        'student__student_profile', 'assigned_to'
    ).prefetch_related('assignment_history__assigned_to', 'assignment_history__assigned_by')
    serializer_class = ComplaintSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'category', 'student__username', 'student__first_name', 'student__last_name']

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'WARDEN'] or user.is_superuser:
            qs = super().get_queryset()
            status_param = self.request.query_params.get('status')
            if status_param:
                qs = qs.filter(status=status_param)
            category_param = self.request.query_params.get('category')
            if category_param:
                qs = qs.filter(category=category_param)
            priority_param = self.request.query_params.get('priority')
            if priority_param:
                qs = qs.filter(priority=priority_param)
            return qs
        elif user.role == 'STUDENT':
            return super().get_queryset().filter(student=user)
        return Complaint.objects.none()

    def perform_create(self, serializer):
        # Always set logged in student
        serializer.save(student=self.request.user, status='SUBMITTED')

    def perform_update(self, serializer):
        user = self.request.user
        instance = serializer.instance
        old_status = instance.status
        old_assigned = instance.assigned_to

        # Students can only update their own complaint if status is still SUBMITTED (e.g. edit description)
        if user.role == 'STUDENT':
            if instance.status != 'SUBMITTED':
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You cannot edit a complaint that is already being processed.")
            serializer.save()
            return

        # Admin or Warden updating status or assigned person
        complaint = serializer.save()

        # Record history if status or assignment changed
        new_status = complaint.status
        new_assigned = complaint.assigned_to

        if new_assigned and (new_status != old_status or new_assigned != old_assigned):
            ComplaintAssignment.objects.create(
                complaint=complaint,
                assigned_to=new_assigned,
                assigned_by=user,
                notes=complaint.resolution_notes or f"Status changed to {complaint.get_status_display()}",
                status=new_status
            )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user
        if user.role == 'STUDENT':
            base_qs = Complaint.objects.filter(student=user)
        else:
            base_qs = Complaint.objects.all()

        total = base_qs.count()
        submitted = base_qs.filter(status='SUBMITTED').count()
        in_progress = base_qs.filter(status__in=['UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS']).count()
        resolved = base_qs.filter(status='RESOLVED').count()
        rejected = base_qs.filter(status='REJECTED').count()

        category_counts = list(base_qs.values('category').annotate(count=Count('id')))

        return Response({
            'total': total,
            'submitted': submitted,
            'in_progress': in_progress,
            'resolved': resolved,
            'rejected': rejected,
            'categories': category_counts
        })
