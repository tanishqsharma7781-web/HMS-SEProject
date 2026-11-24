from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Visitor(models.Model):
    STATUS_CHOICES = (
        ('INSIDE', 'Inside Campus'),
        ('EXITED', 'Exited'),
    )

    visitor_name = models.CharField(max_length=100)
    visitor_phone = models.CharField(max_length=20)
    visitor_id_proof = models.CharField(max_length=50, blank=True, default='')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='visitors')
    purpose = models.CharField(max_length=200)
    entry_time = models.DateTimeField(auto_now_add=True)
    exit_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='INSIDE')
    registered_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='registered_visitors'
    )
    remarks = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-entry_time']

    def __str__(self):
        return f"{self.visitor_name} visiting {self.student.username} ({self.status})"
