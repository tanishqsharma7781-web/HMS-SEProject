from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from datetime import timedelta
from .models import FoodMenu, FoodMenuItem
from .serializers import FoodMenuSerializer, FoodMenuItemSerializer
from users.permissions import IsAdminOrWarden

class FoodMenuViewSet(viewsets.ModelViewSet):
    queryset = FoodMenu.objects.all().prefetch_related('items').order_by('date')
    serializer_class = FoodMenuSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'toggle_publish']:
            return [IsAdminOrWarden()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        # Students only see published menus
        if user.role == 'STUDENT':
            qs = qs.filter(is_published=True)

        date_param = self.request.query_params.get('date')
        if date_param:
            qs = qs.filter(date=date_param)

        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def today(self, request):
        today_date = timezone.localdate()
        user = request.user

        menu = FoodMenu.objects.filter(date=today_date).prefetch_related('items').first()
        if not menu or (user.role == 'STUDENT' and not menu.is_published):
            # Fallback to the latest available menu so UI never looks empty
            fallback = FoodMenu.objects.filter(is_published=True).prefetch_related('items').order_by('-date').first()
            if fallback:
                return Response({
                    'found': True,
                    'is_today': False,
                    'message': 'Showing recent published menu schedule',
                    'menu': FoodMenuSerializer(fallback).data
                })
            return Response({'found': False, 'message': 'No menu available for today.'})

        return Response({
            'found': True,
            'is_today': True,
            'menu': FoodMenuSerializer(menu).data
        })

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        today_date = timezone.localdate()
        user = request.user
        qs = FoodMenu.objects.filter(date__gte=today_date).prefetch_related('items').order_by('date')[:7]
        
        if user.role == 'STUDENT':
            qs = qs.filter(is_published=True)

        return Response(FoodMenuSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'])
    def toggle_publish(self, request, pk=None):
        menu = self.get_object()
        menu.is_published = not menu.is_published
        menu.save(update_fields=['is_published'])
        return Response({
            'message': f"Menu for {menu.date} is now {'published' if menu.is_published else 'draft'}.",
            'is_published': menu.is_published
        })
