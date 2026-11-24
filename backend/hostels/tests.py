from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from users.models import StudentProfile
from hostels.models import Hostel, Block, Room, RoomAllocation

User = get_user_model()

class HostelRoomAndAllocationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin_test',
            email='admin@test.com',
            password='Password123!',
            role='ADMIN'
        )
        self.student1 = User.objects.create_user(
            username='stu1', email='stu1@test.com', password='Password123!', role='STUDENT'
        )
        self.student2 = User.objects.create_user(
            username='stu2', email='stu2@test.com', password='Password123!', role='STUDENT'
        )
        self.student3 = User.objects.create_user(
            username='stu3', email='stu3@test.com', password='Password123!', role='STUDENT'
        )
        StudentProfile.objects.create(user=self.student1, student_id='STU-101', department='CSE', course='B.Tech')
        StudentProfile.objects.create(user=self.student2, student_id='STU-102', department='ECE', course='B.Tech')
        StudentProfile.objects.create(user=self.student3, student_id='STU-103', department='ME', course='B.Tech')

        self.hostel = Hostel.objects.create(name='Test Hostel', code='TH-1', address='Campus Enclave')
        self.block = Block.objects.create(hostel=self.hostel, name='Block Alpha', code='BA', gender_type='BOYS')
        # Create a single-capacity room (capacity=1)
        self.room_single = Room.objects.create(
            block=self.block, room_number='101', floor=1, room_type='SINGLE', capacity=1, fee_per_semester=30000
        )
        # Create a double-capacity room (capacity=2)
        self.room_double = Room.objects.create(
            block=self.block, room_number='102', floor=1, room_type='DOUBLE', capacity=2, fee_per_semester=25000
        )

    def test_room_allocation_within_capacity(self):
        """Test allocating student within room capacity succeeds"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/hostels/allocations/', {
            'student': self.student1.id,
            'room': self.room_single.id,
            'bed_number': 'Bed 1',
            'academic_year': '2026-2027',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.room_single.occupied_count, 1)
        self.assertEqual(self.room_single.vacant_count, 0)
        self.assertTrue(self.room_single.is_full)

    def test_room_allocation_exceeding_capacity_rejected(self):
        """Integration Test: Allocating to a full room is rejected"""
        # First allocation fills room (capacity = 1)
        RoomAllocation.objects.create(
            student=self.student1,
            room=self.room_single,
            bed_number='Bed 1',
            status='ACTIVE'
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/hostels/allocations/', {
            'student': self.student2.id,
            'room': self.room_single.id,
            'bed_number': 'Bed 2',
            'academic_year': '2026-2027',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('full capacity', str(response.data).lower())

    def test_vacating_room_updates_vacancy(self):
        """Test vacating an allocation restores vacancy count"""
        alloc = RoomAllocation.objects.create(
            student=self.student1,
            room=self.room_single,
            bed_number='Bed 1',
            status='ACTIVE'
        )
        self.assertEqual(self.room_single.vacant_count, 0)

        self.client.force_authenticate(user=self.admin)
        response = self.client.post(f'/api/hostels/allocations/{alloc.id}/vacate/', {
            'notes': 'Semester ended'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        alloc.refresh_from_db()
        self.assertEqual(alloc.status, 'VACATED')
        self.assertEqual(self.room_single.vacant_count, 1)

    def test_student_my_room_endpoint(self):
        """Test student can retrieve their own room and roommates"""
        RoomAllocation.objects.create(
            student=self.student1,
            room=self.room_double,
            bed_number='Bed 1',
            status='ACTIVE'
        )
        RoomAllocation.objects.create(
            student=self.student2,
            room=self.room_double,
            bed_number='Bed 2',
            status='ACTIVE'
        )

        self.client.force_authenticate(user=self.student1)
        response = self.client.get('/api/hostels/allocations/my_room/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['allocated'])
        self.assertEqual(response.data['room_number'], '102')
        self.assertEqual(len(response.data['roommates']), 1)
        self.assertEqual(response.data['roommates'][0]['student_id'], 'STU-102')
