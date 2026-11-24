from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/users/', include('users.urls')),
    path('api/hostels/', include('hostels.urls')),
    path('api/fees/', include('fees.urls')),
    path('api/food-menu/', include('food_menu.urls')),
    path('api/complaints/', include('complaints.urls')),
    path('api/attendance/', include('attendance.urls')),
    path('api/visitors/', include('visitors.urls')),
    path('api/notices/', include('notices.urls')),
    path('api/analytics/', include('analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
