from rest_framework import serializers
from users.models import CustomUser
from academic.models import Student, Teacher, Subject, Evaluation, Grade, Schedule
from administrative.models import Payment, ExchangeRate, PaymentConcept

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'address', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

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
    subject_name = serializers.CharField(source='evaluation.subject.name', read_only=True)
    subject_id = serializers.IntegerField(source='evaluation.subject.id', read_only=True)

    class Meta:
        model = Grade
        fields = ['id', 'student', 'evaluation', 'score', 'evaluation_name', 'evaluation_date', 'subject_name', 'subject_id']

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
