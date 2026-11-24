from rest_framework import serializers
from .models import FoodMenu, FoodMenuItem

class FoodMenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodMenuItem
        fields = ['id', 'meal_type', 'items', 'start_time', 'end_time', 'special_item']


class FoodMenuSerializer(serializers.ModelSerializer):
    items = FoodMenuItemSerializer(many=True, required=False)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = FoodMenu
        fields = [
            'id', 'date', 'day_of_week', 'is_published', 'special_notes',
            'created_by', 'created_by_name', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'day_of_week']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return 'System'

    def create(self, validated_data):
        items_data = self.context.get('request').data.get('items', [])
        validated_data.pop('items', None)
        menu = FoodMenu.objects.create(**validated_data)
        
        # Default empty items if not provided
        meals = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER']
        items_dict = {item.get('meal_type'): item for item in items_data if isinstance(item, dict)}

        for meal in meals:
            item_info = items_dict.get(meal, {})
            FoodMenuItem.objects.create(
                menu=menu,
                meal_type=meal,
                items=item_info.get('items', 'Standard hostel meal menu'),
                start_time=item_info.get('start_time', ''),
                end_time=item_info.get('end_time', ''),
                special_item=item_info.get('special_item', '')
            )
        return menu

    def update(self, instance, validated_data):
        items_data = self.context.get('request').data.get('items', None)
        
        instance.date = validated_data.get('date', instance.date)
        instance.is_published = validated_data.get('is_published', instance.is_published)
        instance.special_notes = validated_data.get('special_notes', instance.special_notes)
        instance.day_of_week = instance.date.strftime('%A')
        instance.save()

        if items_data is not None and isinstance(items_data, list):
            for item_data in items_data:
                meal = item_data.get('meal_type')
                if meal:
                    menu_item, created = FoodMenuItem.objects.get_or_create(menu=instance, meal_type=meal)
                    menu_item.items = item_data.get('items', menu_item.items)
                    menu_item.start_time = item_data.get('start_time', menu_item.start_time)
                    menu_item.end_time = item_data.get('end_time', menu_item.end_time)
                    menu_item.special_item = item_data.get('special_item', menu_item.special_item)
                    menu_item.save()

        return instance
