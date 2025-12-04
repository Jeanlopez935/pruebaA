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
             return Student.objects.filter(subject__teacher__user=user).distinct() 
        return Student.objects.all()

    @action(detail=True, methods=['get'])
    def report_card(self, request, pk=None):
        import io
        from datetime import datetime
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        from django.http import FileResponse
        from django.db.models import Sum, F
        
        student = self.get_object()
        
        # Fetch all grades for this student
        grades = Grade.objects.filter(student=student).select_related('evaluation', 'evaluation__subject')
        
        # Organize data: Subject -> Lapso -> Final Score
        # Final Score = Sum(Grade * Percentage / 100) or just Sum(Grade) if weighted?
        # Assuming Grade is 0-20 and Percentage is weight. 
        # Actually, usually Grade is 0-20. If Eval is 20%, and Grade is 20, contribution is 4 pts.
        # Let's calculate: score * (percentage / 100)
        
        report_data = {}
        subjects = set()
        
        for grade in grades:
            subj_name = grade.evaluation.subject.name
            lapso = grade.evaluation.lapso
            percentage = grade.evaluation.percentage
            score = grade.score
            
            if subj_name not in report_data:
                report_data[subj_name] = {1: 0, 2: 0, 3: 0}
            
            subjects.add(subj_name)
            
            # Calculate weighted contribution
            contribution = (score * percentage) / 100
            report_data[subj_name][lapso] += contribution

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Header
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, height - 50, "Boletín Informativo")
        
        p.setFont("Helvetica", 12)
        p.drawString(50, height - 80, f"Estudiante: {student.first_name} {student.last_name}")
        p.drawString(50, height - 100, f"Cédula: {student.id_number}")
        p.drawString(50, height - 120, f"Grado: {student.current_grade} - Sección: {student.section}")
        
        # Emission Date
        now = datetime.now().strftime("%d/%m/%Y %I:%M %p")
        p.setFont("Helvetica-Oblique", 10)
        p.drawString(50, height - 140, f"Fecha de emisión: {now}")
        
        # Table Header
        y = height - 180
        p.setFont("Helvetica-Bold", 10)
        p.drawString(50, y, "Asignatura")
        p.drawString(250, y, "1er Lapso")
        p.drawString(330, y, "2do Lapso")
        p.drawString(410, y, "3er Lapso")
        p.drawString(490, y, "Definitiva")
        
        p.line(50, y - 5, 550, y - 5)
        y -= 25
        
        # Table Content
        p.setFont("Helvetica", 10)
        for subject in sorted(list(subjects)):
            p.drawString(50, y, subject[:35])
            
            # 1er Lapso
            l1 = report_data[subject].get(1, 0)
            p.drawString(250, y, f"{l1:.2f}")
            
            # 2do Lapso
            l2 = report_data[subject].get(2, 0)
            p.drawString(330, y, f"{l2:.2f}")
            
            # 3er Lapso
            l3 = report_data[subject].get(3, 0)
            p.drawString(410, y, f"{l3:.2f}")
            
            # Definitiva (Average)
            definitiva = (l1 + l2 + l3) / 3
            p.setFont("Helvetica-Bold", 10)
            p.drawString(490, y, f"{definitiva:.2f}")
            p.setFont("Helvetica", 10)
            
            y -= 20
            
            if y < 50:
                p.showPage()
                y = height - 50
                
        p.showPage()
        p.save()
        
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=f'boletin_{student.id_number}.pdf')

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
