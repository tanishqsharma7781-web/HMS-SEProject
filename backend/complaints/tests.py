from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from users.models import StudentProfile, WardenProfile
from complaints.models import Complaint, ComplaintAssignment

User = get_user_model()

class ComplaintWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin_comp', email='admin@test.com', password='Password123!', role='ADMIN'
        )
        self.warden = User.objects.create_user(
            username='warden_comp', email='warden@test.com', password='Password123!', role='WARDEN'
        )
        WardenProfile.objects.create(user=self.warden, employee_id='WRD-COMP-1')
        self.student = User.objects.create_user(
            username='student_comp', email='stu@test.com', password='Password123!', role='STUDENT'
        )
        StudentProfile.objects.create(user=self.student, student_id='STU-COMP-1', department='ECE', course='B.Tech')

    def test_student_submit_complaint(self):
        """Test student can lodge a new complaint"""
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/complaints/', {
            'category': 'ELECTRICAL',
            'title': 'Tube light failure',
            'description': 'Light bulb flickers constantly in room',
            'priority': 'MEDIUM'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'SUBMITTED')
        self.assertEqual(response.data['student_name'], self.student.username)

    def test_warden_assigns_and_resolves_complaint(self):
        """Test warden can review, assign, and resolve complaint with audit trail"""
        complaint = Complaint.objects.create(
            student=self.student,
            category='PLUMBING',
            title='Tap dripping',
            description='Slow water drip in washbasin',
            priority='LOW',
            status='SUBMITTED'
        )

        self.client.force_authenticate(user=self.warden)
        # Step 1: Assign complaint
        response = self.client.patch(f'/api/complaints/{complaint.id}/', {
            'status': 'IN_PROGRESS',
            'assigned_to': self.warden.id,
            'resolution_notes': 'Plumber assigned to inspect'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        complaint.refresh_from_db()
        self.assertEqual(complaint.status, 'IN_PROGRESS')
        self.assertEqual(complaint.assigned_to, self.warden)

        # Verify assignment record created
        self.assertTrue(ComplaintAssignment.objects.filter(complaint=complaint).exists())

        # Step 2: Resolve complaint
        response = self.client.patch(f'/api/complaints/{complaint.id}/', {
            'status': 'RESOLVED',
            'resolution_notes': 'Washer replaced, leak stopped completely.'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        complaint.refresh_from_db()
        self.assertEqual(complaint.status, 'RESOLVED')
