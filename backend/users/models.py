from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Administrator'),
        ('WARDEN', 'Warden'),
        ('STUDENT', 'Student'),
        ('SECURITY', 'Security Staff'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_pic = models.ImageField(upload_to='profiles/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_admin(self):
        return self.role == 'ADMIN' or self.is_superuser

    @property
    def is_warden(self):
        return self.role == 'WARDEN'

    @property
    def is_student(self):
        return self.role == 'STUDENT'

    @property
    def is_security(self):
        return self.role == 'SECURITY'


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=30, unique=True)
    department = models.CharField(max_length=100)
    course = models.CharField(max_length=100)
    year_of_study = models.PositiveIntegerField(default=1)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=10, 
        choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], 
        default='Male'
    )
    blood_group = models.CharField(max_length=10, blank=True, default='')
    address = models.TextField(blank=True, default='')
    parent_name = models.CharField(max_length=100, blank=True, default='')
    parent_phone = models.CharField(max_length=20, blank=True, default='')
    parent_relation = models.CharField(max_length=50, blank=True, default='Parent')
    emergency_contact = models.CharField(max_length=20, blank=True, default='')

    def __str__(self):
        return f"{self.student_id} - {self.user.get_full_name() or self.user.username}"


class WardenProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='warden_profile')
    employee_id = models.CharField(max_length=30, unique=True)
    qualification = models.CharField(max_length=100, blank=True, default='')
    emergency_contact = models.CharField(max_length=20, blank=True, default='')
    assigned_block = models.ForeignKey(
        'hostels.Block', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_wardens'
    )

    def __str__(self):
        return f"Warden: {self.employee_id} - {self.user.get_full_name() or self.user.username}"


class SecurityProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='security_profile')
    employee_id = models.CharField(max_length=30, unique=True)
    shift = models.CharField(
        max_length=30,
        choices=[('Day', 'Day Shift'), ('Night', 'Night Shift'), ('Rotating', 'Rotating Shift')],
        default='Day'
    )
    gate_number = models.CharField(max_length=50, default='Main Gate 1')

    def __str__(self):
        return f"Security: {self.employee_id} - {self.user.get_full_name() or self.user.username}"
