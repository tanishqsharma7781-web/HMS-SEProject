import uuid
from rest_framework import serializers
from .models import Fee, Payment
from users.serializers import UserSerializer

class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    fee_semester = serializers.CharField(source='fee.semester', read_only=True)
    fee_type = serializers.CharField(source='fee.fee_type', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'fee', 'fee_semester', 'fee_type', 'student', 'student_name', 'student_id',
            'amount', 'payment_date', 'payment_method', 'transaction_id',
            'receipt_number', 'status', 'remarks'
        ]
        read_only_fields = ['id', 'payment_date', 'transaction_id', 'receipt_number']

    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username

    def get_student_id(self, obj):
        if hasattr(obj.student, 'student_profile'):
            return obj.student.student_profile.student_id
        return ''


class FeeSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    student_email = serializers.EmailField(source='student.email', read_only=True)
    student_phone = serializers.CharField(source='student.phone', read_only=True)
    paid_amount = serializers.ReadOnlyField()
    pending_amount = serializers.ReadOnlyField()
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Fee
        fields = [
            'id', 'student', 'student_name', 'student_id', 'student_email', 'student_phone',
            'academic_year', 'semester', 'fee_type', 'amount', 'due_date',
            'status', 'paid_amount', 'pending_amount', 'payments', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'status']

    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username

    def get_student_id(self, obj):
        if hasattr(obj.student, 'student_profile'):
            return obj.student.student_profile.student_id
        return ''


class CheckoutSerializer(serializers.Serializer):
    fee_id = serializers.IntegerField(required=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    payment_method = serializers.ChoiceField(choices=Payment.METHOD_CHOICES, default='ONLINE')
    remarks = serializers.CharField(required=False, allow_blank=True, default='Online Portal Payment')
