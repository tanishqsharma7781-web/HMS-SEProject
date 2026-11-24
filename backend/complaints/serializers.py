from rest_framework import serializers
from .models import Complaint, ComplaintAssignment

class ComplaintAssignmentSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()
    assigned_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ComplaintAssignment
        fields = ['id', 'assigned_to', 'assigned_to_name', 'assigned_by', 'assigned_by_name', 'notes', 'status', 'assigned_at']

    def get_assigned_to_name(self, obj):
        return obj.assigned_to.get_full_name() or obj.assigned_to.username

    def get_assigned_by_name(self, obj):
        if obj.assigned_by:
            return obj.assigned_by.get_full_name() or obj.assigned_by.username
        return 'System'


class ComplaintSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    student_room = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    assignment_history = ComplaintAssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id', 'student', 'student_name', 'student_id', 'student_room',
            'category', 'title', 'description', 'priority', 'status',
            'assigned_to', 'assigned_to_name', 'resolution_notes',
            'assignment_history', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student', 'created_at', 'updated_at']

    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username

    def get_student_id(self, obj):
        if hasattr(obj.student, 'student_profile'):
            return obj.student.student_profile.student_id
        return ''

    def get_student_room(self, obj):
        alloc = obj.student.room_allocations.filter(status='ACTIVE').select_related('room__block').first()
        if alloc:
            return f"{alloc.room.block.name} - Rm {alloc.room.room_number}"
        return 'Unallocated'

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.get_full_name() or obj.assigned_to.username
        return 'Unassigned'
