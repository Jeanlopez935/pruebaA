from rest_framework import serializers
from users.models import CustomUser
from academic.models import Student, Teacher, Subject, Evaluation, Grade, Schedule
from administrative.models import Payment, ExchangeRate, PaymentConcept

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'address', 'password', 'visible_password']
        extra_kwargs = {'visible_password': {'read_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        # Store password in visible_password field
        validated_data['visible_password'] = password
        user = CustomUser.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password)
            instance.visible_password = password
        return super().update(instance, validated_data)

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), source='user', write_only=True
    )

    class Meta:
        model = Teacher
        fields = '__all__'

class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'

    def validate(self, data):
        subject = data.get('subject')
        day = data.get('day')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        if self.instance:
            subject = subject or self.instance.subject
            day = day or self.instance.day
            start_time = start_time or self.instance.start_time
            end_time = end_time or self.instance.end_time

        # Check for overlaps in the same section and grade
        overlapping = Schedule.objects.filter(
            subject__grade_level=subject.grade_level,
            subject__section=subject.section,
            day=day,
            start_time__lt=end_time,
            end_time__gt=start_time
        )
        
        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)
            
        if overlapping.exists():
            raise serializers.ValidationError("Choque de horario: Ya existe una materia asignada a esta hora para esta sección.")
            
        return data

class SubjectSerializer(serializers.ModelSerializer):
    schedules = ScheduleSerializer(many=True, read_only=True)
    
    class Meta:
        model = Subject
        fields = '__all__'

class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = '__all__'

class GradeSerializer(serializers.ModelSerializer):
    evaluation_name = serializers.CharField(source='evaluation.name', read_only=True)
    evaluation_date = serializers.DateField(source='evaluation.date', read_only=True)
    evaluation_lapso = serializers.IntegerField(source='evaluation.lapso', read_only=True)
    subject_name = serializers.CharField(source='evaluation.subject.name', read_only=True)
    subject_id = serializers.IntegerField(source='evaluation.subject.id', read_only=True)

    class Meta:
        model = Grade
        fields = ['id', 'student', 'evaluation', 'score', 'evaluation_name', 'evaluation_date', 'evaluation_lapso', 'subject_name', 'subject_id']

class PaymentConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentConcept
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.first_name', read_only=True)
    student_lastname = serializers.CharField(source='student.last_name', read_only=True)
    student_grade = serializers.CharField(source='student.current_grade', read_only=True)
    student_section = serializers.CharField(source='student.section', read_only=True)
    student_cedula = serializers.CharField(source='student.id_number', read_only=True)
    
    representative_name = serializers.CharField(source='student.representative.first_name', read_only=True)
    representative_lastname = serializers.CharField(source='student.representative.last_name', read_only=True)
    representative_cedula = serializers.CharField(source='student.representative.username', read_only=True)
    representative_phone = serializers.CharField(source='student.representative.phone_number', read_only=True)
    representative_email = serializers.CharField(source='student.representative.email', read_only=True)
    representative_address = serializers.CharField(source='student.representative.address', read_only=True)
    
    payment_concept_name = serializers.CharField(source='payment_concept.name', read_only=True)
    payment_concept_amount = serializers.DecimalField(source='payment_concept.amount_usd', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'

class ExchangeRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeRate
        fields = '__all__'
