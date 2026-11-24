from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeeViewSet, PaymentViewSet

router = DefaultRouter()
router.register(r'records', FeeViewSet, basename='fees')
router.register(r'payments', PaymentViewSet, basename='payments')

urlpatterns = [
    path('', include(router.urls)),
]
