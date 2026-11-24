import uuid
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, Count, Q
from .models import Fee, Payment
from .serializers import FeeSerializer, PaymentSerializer, CheckoutSerializer
from users.permissions import IsAdminUser

class FeeViewSet(viewsets.ModelViewSet):
    queryset = Fee.objects.all().select_related('student__student_profile').prefetch_related('payments')
    serializer_class = FeeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = [
        'student__username', 'student__first_name', 'student__last_name',
        'student__student_profile__student_id', 'semester', 'academic_year', 'status'
    ]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'WARDEN'] or user.is_superuser:
            qs = super().get_queryset()
            status_param = self.request.query_params.get('status')
            if status_param:
                qs = qs.filter(status=status_param)
            semester_param = self.request.query_params.get('semester')
            if semester_param:
                qs = qs.filter(semester=semester_param)
            return qs
        elif user.role == 'STUDENT':
            return super().get_queryset().filter(student=user)
        return Fee.objects.none()

    @action(detail=False, methods=['get'])
    def summary(self, request):
        user = request.user
        if user.role == 'STUDENT':
            student_fees = Fee.objects.filter(student=user)
            total_fee = student_fees.aggregate(sum=Sum('amount'))['sum'] or 0
            paid_fee = Payment.objects.filter(student=user, status='SUCCESS').aggregate(sum=Sum('amount'))['sum'] or 0
            pending_fee = max(0, float(total_fee) - float(paid_fee))

            return Response({
                'total_fee': float(total_fee),
                'paid_fee': float(paid_fee),
                'pending_fee': float(pending_fee),
                'total_bills': student_fees.count(),
                'paid_bills': student_fees.filter(status='PAID').count(),
                'pending_bills': student_fees.filter(status__in=['PENDING', 'PARTIAL']).count(),
            })
        else:
            total_fee = Fee.objects.aggregate(sum=Sum('amount'))['sum'] or 0
            paid_fee = Payment.objects.filter(status='SUCCESS').aggregate(sum=Sum('amount'))['sum'] or 0
            pending_fee = max(0, float(total_fee) - float(paid_fee))

            return Response({
                'total_fee': float(total_fee),
                'paid_fee': float(paid_fee),
                'pending_fee': float(pending_fee),
                'total_records': Fee.objects.count(),
                'paid_records': Fee.objects.filter(status='PAID').count(),
                'pending_records': Fee.objects.filter(status__in=['PENDING', 'PARTIAL']).count(),
            })


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().select_related('student__student_profile', 'fee')
    serializer_class = PaymentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = [
        'transaction_id', 'receipt_number', 'student__username',
        'student__first_name', 'student__last_name', 'student__student_profile__student_id'
    ]

    def get_permissions(self):
        if self.action in ['destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'WARDEN'] or user.is_superuser:
            return super().get_queryset()
        elif user.role == 'STUDENT':
            return super().get_queryset().filter(student=user)
        return Payment.objects.none()

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        """Simulate secure online demo payment gateway processing"""
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        fee_id = serializer.validated_data['fee_id']
        amount = serializer.validated_data['amount']
        method = serializer.validated_data['payment_method']
        remarks = serializer.validated_data.get('remarks', 'Demo Online Payment')

        try:
            fee = Fee.objects.get(id=fee_id)
        except Fee.DoesNotExist:
            return Response({'error': 'Fee record not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Ensure student pays only their own fee unless admin
        if request.user.role == 'STUDENT' and fee.student != request.user:
            return Response({'error': 'Unauthorized fee payment attempt.'}, status=status.HTTP_403_FORBIDDEN)

        if float(amount) <= 0:
            return Response({'error': 'Payment amount must be greater than zero.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create payment record
        txn_id = f"TXN-HMS-{uuid.uuid4().hex[:10].upper()}"
        receipt = f"RCP-HMS-{uuid.uuid4().hex[:8].upper()}"

        payment = Payment.objects.create(
            fee=fee,
            student=fee.student,
            amount=amount,
            payment_method=method,
            transaction_id=txn_id,
            receipt_number=receipt,
            status='SUCCESS',
            remarks=remarks
        )

        return Response({
            'message': 'Payment processed successfully! Fee record updated.',
            'payment': PaymentSerializer(payment).data,
            'fee_status': fee.status,
            'fee_pending_amount': fee.pending_amount
        }, status=status.HTTP_201_CREATED)
