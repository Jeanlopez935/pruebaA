from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from .serializers import (
    UserSerializer, StudentSerializer, TeacherSerializer, 
    SubjectSerializer, EvaluationSerializer, GradeSerializer, 
    PaymentSerializer, ExchangeRateSerializer, PaymentConceptSerializer, ScheduleSerializer
)
from users.models import CustomUser
from academic.models import Student, Teacher, Subject, Evaluation, Grade, Schedule
from administrative.models import Payment, ExchangeRate, PaymentConcept

class AuthViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        # Delete token on logout
        if request.user.is_authenticated:
            try:
                request.user.auth_token.delete()
            except (AttributeError, Token.DoesNotExist):
                pass
        logout(request)
        return Response({'status': 'logged out'})

    @action(detail=False, methods=['get'])
    def me(self, request):
        if request.user.is_authenticated:
            return Response(UserSerializer(request.user).data)
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'REPRESENTANTE':
            return Student.objects.filter(representative=user)
        elif user.role == 'DOCENTE':
             return Student.objects.all() 
        return Student.objects.all()

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    authentication_classes = [TokenAuthentication, SessionAuthentication]

class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def get_queryset(self):
        user = self.request.user
        queryset = Subject.objects.all()
        if user.role == 'DOCENTE':
            # Assuming Teacher profile is linked to User
            try:
                queryset = queryset.filter(teacher__user=user)
            except:
                pass # If no teacher profile, return empty or all? Better empty.
        return queryset

class EvaluationViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluationSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def get_queryset(self):
        queryset = Evaluation.objects.all()
        subject_id = self.request.query_params.get('subject_id')
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        return queryset

class GradeViewSet(viewsets.ModelViewSet):
    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def get_queryset(self):
        user = self.request.user
        queryset = Grade.objects.all()
        if user.role == 'REPRESENTANTE':
            queryset = queryset.filter(student__representative=user)
        
        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        subject_id = self.request.query_params.get('subject_id')
        if subject_id:
            queryset = queryset.filter(evaluation__subject_id=subject_id)

        evaluation_id = self.request.query_params.get('evaluation_id')
        if evaluation_id:
            queryset = queryset.filter(evaluation_id=evaluation_id)
            
        return queryset

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def get_queryset(self):
        user = self.request.user
        queryset = Payment.objects.all()
        if user.role == 'REPRESENTANTE':
            queryset = queryset.filter(student__representative=user)
            
        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
            
        return queryset

class ExchangeRateViewSet(viewsets.ModelViewSet):
    queryset = ExchangeRate.objects.all()
    serializer_class = ExchangeRateSerializer
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    @action(detail=False, methods=['get'])
    def current(self, request):
        from administrative.utils import get_bcv_rate
        from django.utils import timezone
        
        # Try to get live rate
        rate_value = get_bcv_rate()
        
        if rate_value:
            # Save to DB if it's a new rate or update today's
            # For simplicity, let's just create a new record if the latest is not from today or different
            latest = ExchangeRate.objects.order_by('-date', '-id').first()
            if not latest or latest.rate != rate_value:
                ExchangeRate.objects.create(rate=rate_value)
            
            return Response({'rate': str(rate_value)})
            
        # Fallback to latest stored
        latest = ExchangeRate.objects.order_by('-date', '-id').first()
        if latest:
            return Response({'rate': str(latest.rate)})
            
        return Response({'rate': '36.50'}) # Ultimate fallback

class PaymentConceptViewSet(viewsets.ModelViewSet):
    queryset = PaymentConcept.objects.all()
    serializer_class = PaymentConceptSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def get_queryset(self):
        queryset = CustomUser.objects.all()
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        return queryset

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def get_queryset(self):
        queryset = Schedule.objects.all()
        subject_id = self.request.query_params.get('subject_id')
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        return queryset
