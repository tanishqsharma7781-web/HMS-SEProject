from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HostelViewSet, BlockViewSet, RoomViewSet, RoomAllocationViewSet

router = DefaultRouter()
router.register(r'hostels', HostelViewSet, basename='hostels')
router.register(r'blocks', BlockViewSet, basename='blocks')
router.register(r'rooms', RoomViewSet, basename='rooms')
router.register(r'allocations', RoomAllocationViewSet, basename='allocations')

urlpatterns = [
    path('', include(router.urls)),
]
