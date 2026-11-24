from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

User = settings.AUTH_USER_MODEL

class Hostel(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    address = models.TextField()
    total_floors = models.PositiveIntegerField(default=3)
    warden_in_charge = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='managed_hostels'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

    @property
    def total_rooms(self):
        return sum(b.rooms.count() for b in self.blocks.all())

    @property
    def total_capacity(self):
        return sum(r.capacity for b in self.blocks.all() for r in b.rooms.filter(is_active=True))

    @property
    def total_occupied(self):
        return sum(r.occupied_count for b in self.blocks.all() for r in b.rooms.filter(is_active=True))


class Block(models.Model):
    GENDER_CHOICES = (
        ('BOYS', 'Boys Hostel'),
        ('GIRLS', 'Girls Hostel'),
        ('COED', 'Co-Ed Hostel'),
    )

    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name='blocks')
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=20)
    gender_type = models.CharField(max_length=15, choices=GENDER_CHOICES, default='BOYS')
    total_rooms = models.PositiveIntegerField(default=20)
    warden = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='managed_blocks'
    )

    class Meta:
        unique_together = ('hostel', 'code')

    def __str__(self):
        return f"{self.hostel.name} - {self.name} ({self.code})"


class Room(models.Model):
    ROOM_TYPE_CHOICES = (
        ('SINGLE', 'Single Occupancy'),
        ('DOUBLE', 'Double Occupancy'),
        ('TRIPLE', 'Triple Occupancy'),
        ('QUAD', 'Quad Occupancy'),
    )

    block = models.ForeignKey(Block, on_delete=models.CASCADE, related_name='rooms')
    room_number = models.CharField(max_length=20)
    floor = models.PositiveIntegerField(default=1)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES, default='DOUBLE')
    capacity = models.PositiveIntegerField(default=2)
    fee_per_semester = models.DecimalField(max_digits=10, decimal_places=2, default=25000.00)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, default='')

    class Meta:
        unique_together = ('block', 'room_number')

    def __str__(self):
        return f"{self.block.name} - Rm {self.room_number}"

    @property
    def occupied_count(self):
        return self.allocations.filter(status='ACTIVE').count()

    @property
    def vacant_count(self):
        return max(0, self.capacity - self.occupied_count)

    @property
    def is_full(self):
        return self.occupied_count >= self.capacity


class RoomAllocation(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('VACATED', 'Vacated'),
        ('TRANSFERRED', 'Transferred'),
    )

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='room_allocations')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='allocations')
    bed_number = models.CharField(max_length=15, default='Bed 1')
    academic_year = models.CharField(max_length=20, default='2026-2027')
    allocated_date = models.DateField(auto_now_add=True)
    vacated_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    notes = models.TextField(blank=True, default='')

    def clean(self):
        if self.status == 'ACTIVE':
            # Check capacity
            active_allocations = self.room.allocations.filter(status='ACTIVE').exclude(pk=self.pk)
            if active_allocations.count() >= self.room.capacity:
                raise ValidationError(f"Room {self.room.room_number} is already at full capacity ({self.room.capacity}).")
            
            # Check if student already has another active allocation
            existing = RoomAllocation.objects.filter(student=self.student, status='ACTIVE').exclude(pk=self.pk)
            if existing.exists():
                raise ValidationError(f"Student {self.student.username} is already allocated to another active room.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.username} -> Room {self.room.room_number} ({self.status})"
