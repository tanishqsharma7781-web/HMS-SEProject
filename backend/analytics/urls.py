from django.urls import path
from .views import (
    AdminDashboardStatsView,
    WardenDashboardStatsView,
    SecurityDashboardStatsView,
    ReportsView
)

urlpatterns = [
    path('admin-dashboard/', AdminDashboardStatsView.as_view(), name='admin_dashboard'),
    path('warden-dashboard/', WardenDashboardStatsView.as_view(), name='warden_dashboard'),
    path('security-dashboard/', SecurityDashboardStatsView.as_view(), name='security_dashboard'),
    path('reports/', ReportsView.as_view(), name='reports'),
]
