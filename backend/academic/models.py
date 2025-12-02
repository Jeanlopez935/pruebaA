from django.db import models
from django.conf import settings

class Teacher(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teacher_profile')
    specialty = models.CharField(max_length=100)
    
    def __str__(self):
        return f"Prof. {self.user.get_full_name()}"

class Student(models.Model):
    representative = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='students')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    id_number = models.CharField(max_length=20, unique=True) # Cédula o Cédula Escolar
    birth_date = models.DateField()
    current_grade = models.CharField(max_length=20) # e.g., "1er Año", "5to Grado"
    section = models.CharField(max_length=5) # e.g., "A", "B"
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Subject(models.Model):
    name = models.CharField(max_length=100)
    grade_level = models.CharField(max_length=20) # e.g., "1er Año"
    section = models.CharField(max_length=5, default='A') # e.g., "A", "B"
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, related_name='subjects')
    
    def __str__(self):
        return f"{self.name} ({self.grade_level})"

class Evaluation(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='evaluations')
    name = models.CharField(max_length=100) # e.g., "Parcial 1"
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    date = models.DateField()
    
    def __str__(self):
        return f"{self.name} - {self.subject}"

class Grade(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    evaluation = models.ForeignKey(Evaluation, on_delete=models.CASCADE, related_name='grades')
    score = models.DecimalField(max_digits=4, decimal_places=2) # 0-20
    
    class Meta:
        unique_together = ('student', 'evaluation')

    def __str__(self):
        return f"{self.student} - {self.evaluation}: {self.score}"

class Schedule(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='schedules')
    day = models.CharField(max_length=20) # Lunes, Martes...
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.subject} - {self.day} {self.start_time}"
