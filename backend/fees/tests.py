from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from users.models import StudentProfile
from fees.models import Fee, Payment

User = get_user_model()

class FeeAndPaymentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin_test', email='admin@test.com', password='Password123!', role='ADMIN'
        )
        self.student = User.objects.create_user(
            username='stu_fee', email='fee@test.com', password='Password123!', role='STUDENT'
        )
        StudentProfile.objects.create(user=self.student, student_id='STU-FEE-1', department='CSE', course='B.Tech')
        
        self.fee = Fee.objects.create(
            student=self.student,
            academic_year='2026-2027',
            semester='Sem 1',
            fee_type='TOTAL',
            amount=40000.00,
            due_date='2026-12-31',
            status='PENDING'
        )

    def test_fee_summary(self):
        """Test fee summary calculation"""
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/fees/records/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_fee'], 40000.0)
        self.assertEqual(response.data['pending_fee'], 40000.0)

    def test_demo_payment_checkout_flow(self):
        """Integration Test: Demo online payment checkout updates fee status to PAID"""
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/fees/payments/checkout/', {
            'fee_id': self.fee.id,
            'amount': 40000.00,
            'payment_method': 'ONLINE',
            'remarks': 'Testing payment checkout'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('payment', response.data)
        self.assertIn('receipt_number', response.data['payment'])

        # Verify database update
        self.fee.refresh_from_db()
        self.assertEqual(self.fee.status, 'PAID')
        self.assertEqual(float(self.fee.pending_amount), 0.0)
        self.assertTrue(Payment.objects.filter(fee=self.fee, status='SUCCESS').exists())
