from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from users.models import StudentProfile, WardenProfile, SecurityProfile

User = get_user_model()

class UserAuthenticationAndSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Admin
        self.admin = User.objects.create_superuser(
            username='admin_test',
            email='admin@test.com',
            password='Password123!',
            role='ADMIN'
        )
        # Warden
        self.warden = User.objects.create_user(
            username='warden_test',
            email='warden@test.com',
            password='Password123!',
            role='WARDEN'
        )
        WardenProfile.objects.create(user=self.warden, employee_id='WRD-TEST-1')
        # Student 1
        self.student1 = User.objects.create_user(
            username='student1_test',
            email='student1@test.com',
            password='Password123!',
            role='STUDENT'
        )
        self.stu1_profile = StudentProfile.objects.create(
            user=self.student1,
            student_id='STU-TEST-1',
            department='Computer Science',
            course='B.Tech CSE'
        )
        # Student 2
        self.student2 = User.objects.create_user(
            username='student2_test',
            email='student2@test.com',
            password='Password123!',
            role='STUDENT'
        )
        self.stu2_profile = StudentProfile.objects.create(
            user=self.student2,
            student_id='STU-TEST-2',
            department='Mechanical',
            course='B.Tech ME'
        )
        # Security
        self.security = User.objects.create_user(
            username='sec_test',
            email='sec@test.com',
            password='Password123!',
            role='SECURITY'
        )
        SecurityProfile.objects.create(user=self.security, employee_id='SEC-TEST-1')

    def test_valid_login(self):
        """Test login with valid credentials returns JWT token and user info"""
        response = self.client.post('/api/auth/login/', {
            'username': 'admin_test',
            'password': 'Password123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['role'], 'ADMIN')

    def test_invalid_login(self):
        """Test login with wrong credentials fails with 401"""
        response = self.client.post('/api/auth/login/', {
            'username': 'admin_test',
            'password': 'WrongPassword!'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_access_blocked(self):
        """Unauthenticated requests to protected endpoints should be denied (401)"""
        response = self.client.get('/api/users/students/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_cannot_access_admin_dashboard(self):
        """Security Test: Student role cannot access admin dashboard analytics"""
        self.client.force_authenticate(user=self.student1)
        response = self.client.get('/api/analytics/admin-dashboard/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_access_all_students(self):
        """Security Test: Student querying students list sees only self"""
        self.client.force_authenticate(user=self.student1)
        response = self.client.get('/api/users/students/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Results should only contain student1
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['username'], 'student1_test')

    def test_warden_cannot_modify_admin_accounts(self):
        """Security Test: Warden cannot access or deactivate admin accounts"""
        self.client.force_authenticate(user=self.warden)
        response = self.client.get('/api/users/accounts/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_security_staff_cannot_access_fees(self):
        """Security Test: Security staff cannot access fee management"""
        self.client.force_authenticate(user=self.security)
        response = self.client.post('/api/fees/records/', {
            'student': self.student1.id,
            'amount': 30000,
            'due_date': '2026-12-31'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_register_student(self):
        """Functional Test: Admin can register new student with StudentProfile"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/users/students/', {
            'username': 'new_stu',
            'email': 'new_stu@test.com',
            'first_name': 'New',
            'last_name': 'Student',
            'password': 'Password123!',
            'student_id': 'STU-NEW-99',
            'department': 'Civil Engineering',
            'course': 'B.Tech Civil',
            'year_of_study': 1,
            'gender': 'Male',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='new_stu', role='STUDENT').exists())
        self.assertTrue(StudentProfile.objects.filter(student_id='STU-NEW-99').exists())
