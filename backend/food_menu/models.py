from django.db import models
from django.conf import settings
import datetime

User = settings.AUTH_USER_MODEL

class FoodMenu(models.Model):
    date = models.DateField(unique=True)
    day_of_week = models.CharField(max_length=20, blank=True)
    is_published = models.BooleanField(default=True)
    special_notes = models.CharField(max_length=255, blank=True, default='')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date']

    def save(self, *args, **kwargs):
        if self.date and not self.day_of_week:
            if isinstance(self.date, str):
                import datetime
                try:
                    self.date = datetime.date.fromisoformat(self.date)
                except ValueError:
                    pass
            if hasattr(self.date, 'strftime'):
                self.day_of_week = self.date.strftime('%A')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Menu: {self.date} ({self.day_of_week}) - {'Published' if self.is_published else 'Draft'}"


class FoodMenuItem(models.Model):
    MEAL_CHOICES = (
        ('BREAKFAST', 'Breakfast'),
        ('LUNCH', 'Lunch'),
        ('SNACKS', 'Evening Snacks'),
        ('DINNER', 'Dinner'),
    )

    DEFAULT_TIMINGS = {
        'BREAKFAST': ('07:30 AM', '09:30 AM'),
        'LUNCH': ('12:30 PM', '02:30 PM'),
        'SNACKS': ('05:00 PM', '06:30 PM'),
        'DINNER': ('07:45 PM', '09:45 PM'),
    }

    menu = models.ForeignKey(FoodMenu, on_delete=models.CASCADE, related_name='items')
    meal_type = models.CharField(max_length=20, choices=MEAL_CHOICES)
    items = models.TextField(help_text="Detailed menu items separated by comma or bullet points")
    start_time = models.CharField(max_length=20, blank=True)
    end_time = models.CharField(max_length=20, blank=True)
    special_item = models.CharField(max_length=100, blank=True, default='')

    class Meta:
        unique_together = ('menu', 'meal_type')
        ordering = ['meal_type']

    def save(self, *args, **kwargs):
        if not self.start_time or not self.end_time:
            timing = self.DEFAULT_TIMINGS.get(self.meal_type, ('08:00 AM', '10:00 AM'))
            if not self.start_time:
                self.start_time = timing[0]
            if not self.end_time:
                self.end_time = timing[1]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.menu.date} - {self.get_meal_type_display()}: {self.items[:30]}"
