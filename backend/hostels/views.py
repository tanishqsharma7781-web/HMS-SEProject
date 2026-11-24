from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import Hostel, Block, Room, RoomAllocation
from .serializers import HostelSerializer, BlockSerializer, RoomSerializer, RoomAllocationSerializer
from users.permissions import IsAdminUser, IsAdminOrWarden

class HostelViewSet(viewsets.ModelViewSet):
    queryset = Hostel.objects.all().prefetch_related('blocks__rooms__allocations')
    serializer_class = HostelSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]


class BlockViewSet(viewsets.ModelViewSet):
    queryset = Block.objects.all().select_related('hostel', 'warden')
    serializer_class = BlockSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        hostel_id = self.request.query_params.get('hostel')
        if hostel_id:
            qs = qs.filter(hostel_id=hostel_id)
        return qs


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().select_related('block__hostel').prefetch_related('allocations__student')
    serializer_class = RoomSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['room_number', 'block__name', 'block__code', 'room_type']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrWarden()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        block_id = self.request.query_params.get('block')
        if block_id:
            qs = qs.filter(block_id=block_id)
        
        floor = self.request.query_params.get('floor')
        if floor:
            qs = qs.filter(floor=floor)

        vacant_only = self.request.query_params.get('vacant')
        if vacant_only == 'true':
            # Filter rooms that have capacity > active allocations count
            vacant_ids = [r.id for r in qs if r.vacant_count > 0]
            qs = qs.filter(id__in=vacant_ids)

        return qs


class RoomAllocationViewSet(viewsets.ModelViewSet):
    queryset = RoomAllocation.objects.all().select_related('student__student_profile', 'room__block__hostel')
    serializer_class = RoomAllocationSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = [
        'student__username', 'student__first_name', 'student__last_name',
        'student__student_profile__student_id', 'room__room_number', 'room__block__name'
    ]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'vacate']:
            return [IsAdminOrWarden()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'WARDEN'] or user.is_superuser:
            qs = super().get_queryset()
            status_param = self.request.query_params.get('status')
            if status_param:
                qs = qs.filter(status=status_param)
            return qs
        elif user.role == 'STUDENT':
            return super().get_queryset().filter(student=user)
        return RoomAllocation.objects.none()

    @action(detail=True, methods=['post'])
    def vacate(self, request, pk=None):
        allocation = self.get_object()
        if allocation.status == 'VACATED':
            return Response({'error': 'Room allocation is already vacated.'}, status=status.HTTP_400_BAD_REQUEST)
        
        allocation.status = 'VACATED'
        allocation.vacated_date = timezone.now().date()
        allocation.notes = request.data.get('notes', allocation.notes)
        allocation.save()

        return Response({
            'message': f"Student {allocation.student.username} has been vacated from Room {allocation.room.room_number}.",
            'allocation': RoomAllocationSerializer(allocation).data
        })

    @action(detail=False, methods=['get'])
    def my_room(self, request):
        user = request.user
        if user.role != 'STUDENT':
            return Response({'error': 'Only students have allocated rooms.'}, status=status.HTTP_400_BAD_REQUEST)
        
        active_alloc = RoomAllocation.objects.filter(student=user, status='ACTIVE').select_related(
            'room__block__hostel'
        ).first()

        if not active_alloc:
            return Response({'allocated': False, 'message': 'No active room allocation found.'})

        # Find roommates
        roommates = RoomAllocation.objects.filter(
            room=active_alloc.room,
            status='ACTIVE'
        ).exclude(student=user).select_related('student__student_profile')

        roommates_data = []
        for rm in roommates:
            roommates_data.append({
                'name': rm.student.get_full_name() or rm.student.username,
                'student_id': rm.student.student_profile.student_id if hasattr(rm.student, 'student_profile') else '',
                'department': rm.student.student_profile.department if hasattr(rm.student, 'student_profile') else '',
                'bed_number': rm.bed_number,
                'email': rm.student.email,
                'phone': rm.student.phone
            })

        return Response({
            'allocated': True,
            'allocation_id': active_alloc.id,
            'room_id': active_alloc.room.id,
            'room_number': active_alloc.room.room_number,
            'room_type': active_alloc.room.get_room_type_display(),
            'capacity': active_alloc.room.capacity,
            'occupied': active_alloc.room.occupied_count,
            'floor': active_alloc.room.floor,
            'bed_number': active_alloc.bed_number,
            'block_name': active_alloc.room.block.name,
            'block_code': active_alloc.room.block.code,
            'gender_type': active_alloc.room.block.get_gender_type_display(),
            'hostel_name': active_alloc.room.block.hostel.name,
            'hostel_address': active_alloc.room.block.hostel.address,
            'fee_per_semester': active_alloc.room.fee_per_semester,
            'academic_year': active_alloc.academic_year,
            'allocated_date': active_alloc.allocated_date,
            'roommates': roommates_data
        })
