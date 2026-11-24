from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta

from users.models import StudentProfile, WardenProfile, SecurityProfile
from hostels.models import Hostel, Block, Room, RoomAllocation
from fees.models import Fee, Payment
from complaints.models import Complaint
from attendance.models import Attendance
from visitors.models import Visitor
from notices.models import Notice
from users.permissions import IsAdminUser, IsAdminOrWarden

User = get_user_model()

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.localdate()
        
        # User counts
        total_students = User.objects.filter(role='STUDENT').count()
        total_wardens = User.objects.filter(role='WARDEN').count()
        total_security = User.objects.filter(role='SECURITY').count()

        # Room statistics
        rooms = Room.objects.filter(is_active=True).prefetch_related('allocations')
        total_rooms = rooms.count()
        total_beds = sum(r.capacity for r in rooms)
        total_occupied_beds = sum(r.occupied_count for r in rooms)
        total_vacant_beds = max(0, total_beds - total_occupied_beds)
        occupancy_rate = round((total_occupied_beds / total_beds * 100), 1) if total_beds > 0 else 0

        # Fee statistics
        total_fee_billed = Fee.objects.aggregate(total=Sum('amount'))['total'] or 0
        total_fee_collected = Payment.objects.filter(status='SUCCESS').aggregate(total=Sum('amount'))['total'] or 0
        total_fee_pending = max(0, float(total_fee_billed) - float(total_fee_collected))

        # Complaint statistics
        total_complaints = Complaint.objects.count()
        pending_complaints = Complaint.objects.filter(status__in=['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS']).count()
        resolved_complaints = Complaint.objects.filter(status='RESOLVED').count()

        # Visitor statistics
        active_visitors = Visitor.objects.filter(status='INSIDE').count()
        today_visitors = Visitor.objects.filter(entry_time__date=today).count()

        # Recent activities
        recent_students = list(User.objects.filter(role='STUDENT').order_by('-date_joined')[:5].values(
            'id', 'username', 'first_name', 'last_name', 'email', 'date_joined'
        ))
        recent_payments = list(Payment.objects.select_related('student', 'fee').order_by('-payment_date')[:5].values(
            'id', 'transaction_id', 'amount', 'payment_method', 'payment_date', 'student__username'
        ))
        recent_complaints = list(Complaint.objects.select_related('student').order_by('-created_at')[:5].values(
            'id', 'title', 'category', 'priority', 'status', 'created_at', 'student__username'
        ))

        # Charts data: Occupancy by Block
        blocks = Block.objects.prefetch_related('rooms__allocations')
        occupancy_by_block = []
        for b in blocks:
            b_rooms = b.rooms.filter(is_active=True)
            cap = sum(r.capacity for r in b_rooms)
            occ = sum(r.occupied_count for r in b_rooms)
            occupancy_by_block.append({
                'block': b.name,
                'code': b.code,
                'capacity': cap,
                'occupied': occ,
                'vacant': max(0, cap - occ)
            })

        # Charts data: Complaints by Category
        complaints_by_category = list(Complaint.objects.values('category').annotate(count=Count('id')))

        return Response({
            'counts': {
                'total_students': total_students,
                'total_wardens': total_wardens,
                'total_security': total_security,
                'total_rooms': total_rooms,
                'total_beds': total_beds,
                'occupied_beds': total_occupied_beds,
                'vacant_beds': total_vacant_beds,
                'occupancy_rate': occupancy_rate,
                'total_fee_collected': float(total_fee_collected),
                'total_fee_pending': float(total_fee_pending),
                'total_complaints': total_complaints,
                'pending_complaints': pending_complaints,
                'resolved_complaints': resolved_complaints,
                'active_visitors': active_visitors,
                'today_visitors': today_visitors,
            },
            'recent_activities': {
                'students': recent_students,
                'payments': recent_payments,
                'complaints': recent_complaints,
            },
            'charts': {
                'occupancy_by_block': occupancy_by_block,
                'complaints_by_category': complaints_by_category,
            }
        })


class WardenDashboardStatsView(APIView):
    permission_classes = [IsAdminOrWarden]

    def get(self, request):
        user = request.user
        today = timezone.localdate()

        # If warden has assigned block, filter accordingly
        assigned_block = None
        if hasattr(user, 'warden_profile') and user.warden_profile.assigned_block:
            assigned_block = user.warden_profile.assigned_block

        if assigned_block:
            rooms = Room.objects.filter(block=assigned_block, is_active=True)
            allocated_students_count = RoomAllocation.objects.filter(
                room__block=assigned_block, status='ACTIVE'
            ).count()
        else:
            rooms = Room.objects.filter(is_active=True)
            allocated_students_count = RoomAllocation.objects.filter(status='ACTIVE').count()

        total_beds = sum(r.capacity for r in rooms)
        occupied_beds = sum(r.occupied_count for r in rooms)
        available_beds = max(0, total_beds - occupied_beds)

        pending_complaints = Complaint.objects.filter(
            status__in=['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS']
        ).count()
        
        my_assigned_complaints = Complaint.objects.filter(
            assigned_to=user,
            status__in=['ASSIGNED', 'IN_PROGRESS']
        ).count()

        today_attendance_total = Attendance.objects.filter(date=today).count()
        today_attendance_present = Attendance.objects.filter(date=today, status='PRESENT').count()

        recent_registrations = list(User.objects.filter(role='STUDENT').order_by('-date_joined')[:5].values(
            'id', 'username', 'first_name', 'last_name', 'email', 'date_joined'
        ))

        return Response({
            'managed_block': assigned_block.name if assigned_block else 'All Blocks',
            'students_count': allocated_students_count,
            'total_rooms': rooms.count(),
            'total_beds': total_beds,
            'occupied_beds': occupied_beds,
            'available_beds': available_beds,
            'pending_complaints': pending_complaints,
            'my_assigned_complaints': my_assigned_complaints,
            'today_attendance_total': today_attendance_total,
            'today_attendance_present': today_attendance_present,
            'recent_registrations': recent_registrations
        })


class SecurityDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        today_visitors = Visitor.objects.filter(entry_time__date=today)
        currently_inside = Visitor.objects.filter(status='INSIDE')

        recent_visitors = list(Visitor.objects.select_related('student').order_by('-entry_time')[:10].values(
            'id', 'visitor_name', 'visitor_phone', 'purpose', 'entry_time', 'exit_time',
            'status', 'student__username', 'student__first_name', 'student__last_name'
        ))

        return Response({
            'today_total': today_visitors.count(),
            'currently_inside': currently_inside.count(),
            'today_exited': today_visitors.filter(status='EXITED').count(),
            'recent_visitors': recent_visitors
        })


class ReportsView(APIView):
    permission_classes = [IsAdminOrWarden]

    def get(self, request):
        report_type = request.query_params.get('type', 'students')

        if report_type == 'students':
            data = []
            students = User.objects.filter(role='STUDENT').select_related('student_profile').prefetch_related('room_allocations__room__block')
            for s in students:
                alloc = s.room_allocations.filter(status='ACTIVE').first()
                prof = getattr(s, 'student_profile', None)
                data.append({
                    'id': s.id,
                    'student_id': prof.student_id if prof else '-',
                    'name': s.get_full_name() or s.username,
                    'email': s.email,
                    'phone': s.phone or '-',
                    'department': prof.department if prof else '-',
                    'course': prof.course if prof else '-',
                    'year': prof.year_of_study if prof else '-',
                    'gender': prof.gender if prof else '-',
                    'blood_group': prof.blood_group if prof else '-',
                    'room': f"{alloc.room.block.code}-{alloc.room.room_number}" if alloc else 'Unassigned',
                    'bed': alloc.bed_number if alloc else '-',
                    'status': 'Active' if s.is_active else 'Inactive',
                })
            return Response({'title': 'Student Directory Report', 'generated_at': timezone.now(), 'data': data})

        elif report_type == 'occupancy':
            data = []
            rooms = Room.objects.filter(is_active=True).select_related('block__hostel').prefetch_related('allocations__student')
            for r in rooms:
                allocs = r.allocations.filter(status='ACTIVE')
                students_names = ", ".join([a.student.get_full_name() or a.student.username for a in allocs])
                data.append({
                    'hostel': r.block.hostel.name,
                    'block': r.block.name,
                    'room_number': r.room_number,
                    'floor': r.floor,
                    'type': r.get_room_type_display(),
                    'capacity': r.capacity,
                    'occupied': allocs.count(),
                    'vacant': max(0, r.capacity - allocs.count()),
                    'occupants': students_names or 'None',
                    'fee': float(r.fee_per_semester)
                })
            return Response({'title': 'Room Occupancy Report', 'generated_at': timezone.now(), 'data': data})

        elif report_type == 'fees':
            data = []
            fees = Fee.objects.all().select_related('student__student_profile')
            for f in fees:
                data.append({
                    'id': f.id,
                    'student_name': f.student.get_full_name() or f.student.username,
                    'student_id': f.student.student_profile.student_id if hasattr(f.student, 'student_profile') else '-',
                    'academic_year': f.academic_year,
                    'semester': f.semester,
                    'fee_type': f.get_fee_type_display(),
                    'amount': float(f.amount),
                    'paid_amount': float(f.paid_amount),
                    'pending_amount': float(f.pending_amount),
                    'due_date': f.due_date,
                    'status': f.get_status_display()
                })
            return Response({'title': 'Fee Collection Report', 'generated_at': timezone.now(), 'data': data})

        elif report_type == 'complaints':
            data = []
            complaints = Complaint.objects.all().select_related('student', 'assigned_to')
            for c in complaints:
                data.append({
                    'id': c.id,
                    'student': c.student.get_full_name() or c.student.username,
                    'category': c.get_category_display(),
                    'title': c.title,
                    'priority': c.get_priority_display(),
                    'status': c.get_status_display(),
                    'assigned_to': c.assigned_to.get_full_name() if c.assigned_to else 'Unassigned',
                    'resolution_notes': c.resolution_notes or '-',
                    'created_at': c.created_at.strftime('%Y-%m-%d %H:%M')
                })
            return Response({'title': 'Complaints Analysis Report', 'generated_at': timezone.now(), 'data': data})

        elif report_type == 'attendance':
            data = []
            records = Attendance.objects.all().select_related('student', 'marked_by')[:200]
            for a in records:
                data.append({
                    'student': a.student.get_full_name() or a.student.username,
                    'date': a.date,
                    'status': a.get_status_display(),
                    'marked_by': a.marked_by.get_full_name() if a.marked_by else 'System',
                    'remarks': a.remarks or '-'
                })
            return Response({'title': 'Attendance Log Report', 'generated_at': timezone.now(), 'data': data})

        return Response({'error': 'Invalid report type.'}, status=status.HTTP_400_BAD_REQUEST)
