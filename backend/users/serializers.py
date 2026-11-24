from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import StudentProfile, WardenProfile, SecurityProfile

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'phone': user.phone,
        }
        if user.role == 'STUDENT' and hasattr(user, 'student_profile'):
            data['user']['student_id'] = user.student_profile.student_id
            data['user']['department'] = user.student_profile.department
            data['user']['course'] = user.student_profile.course
        return data


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            'id', 'student_id', 'department', 'course', 'year_of_study',
            'date_of_birth', 'gender', 'blood_group', 'address',
            'parent_name', 'parent_phone', 'parent_relation', 'emergency_contact'
        ]


class WardenProfileSerializer(serializers.ModelSerializer):
    assigned_block_name = serializers.CharField(source='assigned_block.name', read_only=True)
    hostel_name = serializers.CharField(source='assigned_block.hostel.name', read_only=True)

    class Meta:
        model = WardenProfile
        fields = [
            'id', 'employee_id', 'qualification', 'emergency_contact',
            'assigned_block', 'assigned_block_name', 'hostel_name'
        ]


class SecurityProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityProfile
        fields = ['id', 'employee_id', 'shift', 'gate_number']


class UserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(read_only=True)
    warden_profile = WardenProfileSerializer(read_only=True)
    security_profile = SecurityProfileSerializer(read_only=True)
    allocated_room = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'is_active', 'created_at', 'updated_at',
            'student_profile', 'warden_profile', 'security_profile',
            'allocated_room'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_allocated_room(self, obj):
        if obj.role == 'STUDENT':
            active_alloc = obj.room_allocations.filter(status='ACTIVE').select_related('room__block__hostel').first()
            if active_alloc:
                return {
                    'allocation_id': active_alloc.id,
                    'room_id': active_alloc.room.id,
                    'room_number': active_alloc.room.room_number,
                    'block_name': active_alloc.room.block.name,
                    'block_code': active_alloc.room.block.code,
                    'hostel_name': active_alloc.room.block.hostel.name,
                    'floor': active_alloc.room.floor,
                    'bed_number': active_alloc.bed_number,
                    'academic_year': active_alloc.academic_year,
                    'allocated_date': active_alloc.allocated_date,
                    'capacity': active_alloc.room.capacity,
                }
        return None


class StudentRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, default='student123')
    student_id = serializers.CharField(write_only=True)
    department = serializers.CharField(write_only=True)
    course = serializers.CharField(write_only=True)
    year_of_study = serializers.IntegerField(write_only=True, default=1)
    gender = serializers.CharField(write_only=True, default='Male')
    blood_group = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')
    address = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')
    parent_name = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')
    parent_phone = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')
    parent_relation = serializers.CharField(write_only=True, required=False, allow_blank=True, default='Parent')
    emergency_contact = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'phone', 'password',
            'student_id', 'department', 'course', 'year_of_study', 'gender',
            'blood_group', 'address', 'parent_name', 'parent_phone', 'parent_relation', 'emergency_contact'
        ]

    def create(self, validated_data):
        profile_data = {
            'student_id': validated_data.pop('student_id'),
            'department': validated_data.pop('department'),
            'course': validated_data.pop('course'),
            'year_of_study': validated_data.pop('year_of_study', 1),
            'gender': validated_data.pop('gender', 'Male'),
            'blood_group': validated_data.pop('blood_group', ''),
            'address': validated_data.pop('address', ''),
            'parent_name': validated_data.pop('parent_name', ''),
            'parent_phone': validated_data.pop('parent_phone', ''),
            'parent_relation': validated_data.pop('parent_relation', 'Parent'),
            'emergency_contact': validated_data.pop('emergency_contact', ''),
        }
        password = validated_data.pop('password', 'student123')
        validated_data['role'] = 'STUDENT'
        
        with transaction.atomic():
            user = User.objects.create_user(**validated_data)
            user.set_password(password)
            user.save()
            StudentProfile.objects.create(user=user, **profile_data)
        return user

    def update(self, instance, validated_data):
        profile_fields = [
            'student_id', 'department', 'course', 'year_of_study', 'gender',
            'blood_group', 'address', 'parent_name', 'parent_phone', 'parent_relation', 'emergency_contact'
        ]
        profile_data = {}
        for field in profile_fields:
            if field in validated_data:
                profile_data[field] = validated_data.pop(field)

        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if profile_data and hasattr(instance, 'student_profile'):
            for attr, value in profile_data.items():
                setattr(instance.student_profile, attr, value)
            instance.student_profile.save()

        return instance


class WardenRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, default='warden123')
    employee_id = serializers.CharField(write_only=True)
    qualification = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')
    emergency_contact = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')
    assigned_block = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'phone', 'password',
            'employee_id', 'qualification', 'emergency_contact', 'assigned_block'
        ]

    def create(self, validated_data):
        from hostels.models import Block
        profile_data = {
            'employee_id': validated_data.pop('employee_id'),
            'qualification': validated_data.pop('qualification', ''),
            'emergency_contact': validated_data.pop('emergency_contact', ''),
        }
        block_id = validated_data.pop('assigned_block', None)
        if block_id:
            profile_data['assigned_block'] = Block.objects.filter(id=block_id).first()
        
        password = validated_data.pop('password', 'warden123')
        validated_data['role'] = 'WARDEN'

        with transaction.atomic():
            user = User.objects.create_user(**validated_data)
            user.set_password(password)
            user.save()
            WardenProfile.objects.create(user=user, **profile_data)
        return user

    def update(self, instance, validated_data):
        from hostels.models import Block
        profile_fields = ['employee_id', 'qualification', 'emergency_contact']
        profile_data = {}
        for field in profile_fields:
            if field in validated_data:
                profile_data[field] = validated_data.pop(field)

        block_id = validated_data.pop('assigned_block', ...)
        if block_id is not ...:
            profile_data['assigned_block'] = Block.objects.filter(id=block_id).first() if block_id else None

        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if hasattr(instance, 'warden_profile'):
            for attr, value in profile_data.items():
                setattr(instance.warden_profile, attr, value)
            instance.warden_profile.save()

        return instance


class SecurityRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, default='security123')
    employee_id = serializers.CharField(write_only=True)
    shift = serializers.CharField(write_only=True, default='Day')
    gate_number = serializers.CharField(write_only=True, default='Main Gate 1')

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'phone', 'password',
            'employee_id', 'shift', 'gate_number'
        ]

    def create(self, validated_data):
        profile_data = {
            'employee_id': validated_data.pop('employee_id'),
            'shift': validated_data.pop('shift', 'Day'),
            'gate_number': validated_data.pop('gate_number', 'Main Gate 1'),
        }
        password = validated_data.pop('password', 'security123')
        validated_data['role'] = 'SECURITY'

        with transaction.atomic():
            user = User.objects.create_user(**validated_data)
            user.set_password(password)
            user.save()
            SecurityProfile.objects.create(user=user, **profile_data)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)
