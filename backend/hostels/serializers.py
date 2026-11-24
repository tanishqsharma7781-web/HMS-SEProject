from rest_framework import serializers
from django.utils import timezone
from .models import Hostel, Block, Room, RoomAllocation
from users.serializers import UserSerializer

class BlockSerializer(serializers.ModelSerializer):
    hostel_name = serializers.CharField(source='hostel.name', read_only=True)
    warden_name = serializers.SerializerMethodField()
    rooms_count = serializers.SerializerMethodField()

    class Meta:
        model = Block
        fields = [
            'id', 'hostel', 'hostel_name', 'name', 'code',
            'gender_type', 'total_rooms', 'warden', 'warden_name', 'rooms_count'
        ]

    def get_warden_name(self, obj):
        if obj.warden:
            return obj.warden.get_full_name() or obj.warden.username
        return 'Unassigned'

    def get_rooms_count(self, obj):
        return obj.rooms.count()


class HostelSerializer(serializers.ModelSerializer):
    blocks = BlockSerializer(many=True, read_only=True)
    warden_in_charge_name = serializers.SerializerMethodField()
    total_rooms = serializers.ReadOnlyField()
    total_capacity = serializers.ReadOnlyField()
    total_occupied = serializers.ReadOnlyField()

    class Meta:
        model = Hostel
        fields = [
            'id', 'name', 'code', 'address', 'total_floors',
            'warden_in_charge', 'warden_in_charge_name',
            'total_rooms', 'total_capacity', 'total_occupied', 'blocks', 'created_at'
        ]

    def get_warden_in_charge_name(self, obj):
        if obj.warden_in_charge:
            return obj.warden_in_charge.get_full_name() or obj.warden_in_charge.username
        return 'None'


class RoomAllocationSubSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()

    class Meta:
        model = RoomAllocation
        fields = ['id', 'student', 'student_name', 'student_id', 'bed_number', 'allocated_date', 'status']

    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username

    def get_student_id(self, obj):
        if hasattr(obj.student, 'student_profile'):
            return obj.student.student_profile.student_id
        return ''


class RoomSerializer(serializers.ModelSerializer):
    block_name = serializers.CharField(source='block.name', read_only=True)
    block_code = serializers.CharField(source='block.code', read_only=True)
    hostel_name = serializers.CharField(source='block.hostel.name', read_only=True)
    occupied_count = serializers.ReadOnlyField()
    vacant_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    active_allocations = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            'id', 'block', 'block_name', 'block_code', 'hostel_name',
            'room_number', 'floor', 'room_type', 'capacity',
            'fee_per_semester', 'is_active', 'notes',
            'occupied_count', 'vacant_count', 'is_full', 'active_allocations'
        ]

    def get_active_allocations(self, obj):
        allocs = obj.allocations.filter(status='ACTIVE')
        return RoomAllocationSubSerializer(allocs, many=True).data


class RoomAllocationSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    student_phone = serializers.CharField(source='student.phone', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    block_name = serializers.CharField(source='room.block.name', read_only=True)
    hostel_name = serializers.CharField(source='room.block.hostel.name', read_only=True)

    class Meta:
        model = RoomAllocation
        fields = [
            'id', 'student', 'student_name', 'student_id', 'student_phone',
            'room', 'room_number', 'block_name', 'hostel_name',
            'bed_number', 'academic_year', 'allocated_date', 'vacated_date',
            'status', 'notes'
        ]
        read_only_fields = ['id', 'allocated_date']

    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username

    def get_student_id(self, obj):
        if hasattr(obj.student, 'student_profile'):
            return obj.student.student_profile.student_id
        return ''

    def validate(self, attrs):
        status_val = attrs.get('status', 'ACTIVE')
        room = attrs.get('room')
        student = attrs.get('student')

        if status_val == 'ACTIVE':
            instance_pk = self.instance.pk if self.instance else None
            # Check room capacity
            if room:
                active_count = room.allocations.filter(status='ACTIVE').exclude(pk=instance_pk).count()
                if active_count >= room.capacity:
                    raise serializers.ValidationError(
                        f"Room {room.room_number} is already at full capacity ({room.capacity}). No vacant beds available."
                    )
            # Check student already allocated
            if student:
                existing = RoomAllocation.objects.filter(student=student, status='ACTIVE').exclude(pk=instance_pk)
                if existing.exists():
                    raise serializers.ValidationError(
                        f"Student {student.username} already has an active room allocation in Room {existing.first().room.room_number}."
                    )
        return attrs
