from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NoticeViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'announcements', NoticeViewSet, basename='notices')
router.register(r'notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('', include(router.urls)),
]
