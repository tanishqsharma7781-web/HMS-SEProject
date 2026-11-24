from rest_framework import serializers
from .models import Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    student_room = serializers.SerializerMethodField()
    marked_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_name', 'student_id', 'student_room',
            'date', 'status', 'marked_by', 'marked_by_name', 'remarks', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username

    def get_student_id(self, obj):
        if hasattr(obj.student, 'student_profile'):
            return obj.student.student_profile.student_id
        return ''

    def get_student_room(self, obj):
        alloc = obj.student.room_allocations.filter(status='ACTIVE').select_related('room__block').first()
        if alloc:
            return f"{alloc.room.block.name} - {alloc.room.room_number}"
        return '-'

    def get_marked_by_name(self, obj):
        if obj.marked_by:
            return obj.marked_by.get_full_name() or obj.marked_by.username
        return 'System'
