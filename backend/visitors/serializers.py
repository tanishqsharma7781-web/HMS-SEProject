from rest_framework import serializers
from .models import Visitor

class VisitorSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    student_room = serializers.SerializerMethodField()
    registered_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Visitor
        fields = [
            'id', 'visitor_name', 'visitor_phone', 'visitor_id_proof',
            'student', 'student_name', 'student_id', 'student_room',
            'purpose', 'entry_time', 'exit_time', 'status',
            'registered_by', 'registered_by_name', 'remarks'
        ]
        read_only_fields = ['id', 'entry_time']

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

    def get_registered_by_name(self, obj):
        if obj.registered_by:
            return obj.registered_by.get_full_name() or obj.registered_by.username
        return 'Staff'
