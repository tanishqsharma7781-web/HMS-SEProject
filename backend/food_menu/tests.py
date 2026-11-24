from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from food_menu.models import FoodMenu, FoodMenuItem

User = get_user_model()

class FoodMenuTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin_menu', email='admin@test.com', password='Password123!', role='ADMIN'
        )
        self.student = User.objects.create_user(
            username='student_menu', email='stu@test.com', password='Password123!', role='STUDENT'
        )

    def test_admin_create_and_publish_food_menu(self):
        """Test admin can schedule and publish a daily 4-meal food menu"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/food-menu/', {
            'date': '2026-12-01',
            'is_published': True,
            'special_notes': 'Special Sunday Feast',
            'items': [
                {'meal_type': 'BREAKFAST', 'items': 'Idli, Sambar, Chutney, Tea', 'start_time': '07:30 AM', 'end_time': '09:30 AM', 'special_item': 'Medu Vada'},
                {'meal_type': 'LUNCH', 'items': 'Paneer Butter Masala, Rice, Dal', 'start_time': '12:30 PM', 'end_time': '02:30 PM', 'special_item': 'Gulab Jamun'},
                {'meal_type': 'SNACKS', 'items': 'Veg Samosa, Chai', 'start_time': '05:00 PM', 'end_time': '06:30 PM', 'special_item': 'Hot Samosas'},
                {'meal_type': 'DINNER', 'items': 'Dal Makhani, Roti, Salad', 'start_time': '07:45 PM', 'end_time': '09:45 PM', 'special_item': 'Ice Cream'},
            ]
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(FoodMenu.objects.filter(date='2026-12-01').exists())
        menu = FoodMenu.objects.get(date='2026-12-01')
        self.assertEqual(menu.items.count(), 4)

    def test_student_cannot_view_unpublished_draft_menu(self):
        """Security Test: Students can only view published menus"""
        FoodMenu.objects.create(
            date='2026-12-02',
            is_published=False,  # Draft
            special_notes='Draft internal menu'
        )

        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/food-menu/?date=2026-12-02')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 0)
