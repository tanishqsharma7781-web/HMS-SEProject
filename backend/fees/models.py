import uuid
from django.db import models
from django.conf import settings
from django.db.models import Sum

User = settings.AUTH_USER_MODEL

class Fee(models.Model):
    FEE_TYPE_CHOICES = (
        ('HOSTEL', 'Hostel Fee'),
        ('MESS', 'Mess Fee'),
        ('MAINTENANCE', 'Maintenance Fee'),
        ('CAUTION', 'Caution Deposit'),
        ('TOTAL', 'Composite Fee (Room & Mess)'),
    )

    SEMESTER_CHOICES = (
        ('Sem 1', 'Semester 1'),
        ('Sem 2', 'Semester 2'),
        ('Annual', 'Annual Fee'),
    )

    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PARTIAL', 'Partially Paid'),
        ('PAID', 'Paid'),
    )

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fees')
    academic_year = models.CharField(max_length=20, default='2026-2027')
    semester = models.CharField(max_length=20, choices=SEMESTER_CHOICES, default='Sem 1')
    fee_type = models.CharField(max_length=30, choices=FEE_TYPE_CHOICES, default='TOTAL')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} - {self.fee_type} ({self.semester}) - ₹{self.amount}"

    @property
    def paid_amount(self):
        total = self.payments.filter(status='SUCCESS').aggregate(total=Sum('amount'))['total']
        return total or 0

    @property
    def pending_amount(self):
        return max(0, float(self.amount) - float(self.paid_amount))

    def update_status(self):
        paid = float(self.paid_amount)
        total = float(self.amount)
        if paid >= total:
            self.status = 'PAID'
        elif paid > 0:
            self.status = 'PARTIAL'
        else:
            self.status = 'PENDING'
        self.save(update_fields=['status'])


class Payment(models.Model):
    METHOD_CHOICES = (
        ('ONLINE', 'Online Gateway (Card/NetBanking)'),
        ('UPI', 'UPI / QR Code'),
        ('CASH', 'Cash Counter'),
        ('BANK_TRANSFER', 'NEFT / RTGS Bank Transfer'),
        ('DEMO', 'Demonstration Payment'),
    )

    STATUS_CHOICES = (
        ('SUCCESS', 'Success'),
        ('PENDING', 'Pending Verification'),
        ('FAILED', 'Failed'),
    )

    fee = models.ForeignKey(Fee, on_delete=models.CASCADE, related_name='payments')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=30, choices=METHOD_CHOICES, default='DEMO')
    transaction_id = models.CharField(max_length=100, unique=True)
    receipt_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUCCESS')
    remarks = models.TextField(blank=True, default='')

    def save(self, *args, **kwargs):
        if not self.transaction_id:
            self.transaction_id = f"TXN-{uuid.uuid4().hex[:10].upper()}"
        if not self.receipt_number:
            self.receipt_number = f"REC-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
        if self.status == 'SUCCESS':
            self.fee.update_status()

    def __str__(self):
        return f"Payment {self.receipt_number} - ₹{self.amount} for {self.student.username}"
