from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from academic.models import Student, Teacher, Subject, Evaluation, Grade
from administrative.models import Payment, ExchangeRate
from datetime import date, timedelta
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # Create Representative
        rep_user, created = User.objects.get_or_create(
            username='rep1',
            defaults={
                'email': 'rep1@example.com',
                'first_name': 'Maria',
                'last_name': 'Perez',
                'role': 'REPRESENTANTE',
                'phone_number': '0414-1234567',
                'address': 'Calle Principal'
            }
        )
        if created:
            rep_user.set_password('1234')
            rep_user.save()
            self.stdout.write(f'Created representative: {rep_user.username}')

        # Create Teacher
        teacher_user, created = User.objects.get_or_create(
            username='prof1',
            defaults={
                'email': 'prof1@example.com',
                'first_name': 'Carlos',
                'last_name': 'Sanchez',
                'role': 'DOCENTE'
            }
        )
        if created:
            teacher_user.set_password('1234')
            teacher_user.save()
            Teacher.objects.create(user=teacher_user, specialty='Matemáticas')
            self.stdout.write(f'Created teacher: {teacher_user.username}')

        teacher = Teacher.objects.get(user=teacher_user)

        # Create Student
        student, created = Student.objects.get_or_create(
            id_number='30.123.456',
            defaults={
                'representative': rep_user,
                'first_name': 'Juan',
                'last_name': 'Perez',
                'birth_date': date(2015, 5, 15),
                'current_grade': '5to Grado',
                'section': 'A'
            }
        )
        if created:
            self.stdout.write(f'Created student: {student}')

        # Create Subjects
        subjects = ['Matemáticas', 'Lenguaje', 'Historia', 'Ciencias']
        for sub_name in subjects:
            subject, created = Subject.objects.get_or_create(
                name=sub_name,
                grade_level='5to Grado',
                defaults={'teacher': teacher}
            )
            
            # Create Evaluation and Grade
            if created:
                evaluation = Evaluation.objects.create(
                    subject=subject,
                    name='Parcial 1',
                    percentage=20.0,
                    date=date.today() - timedelta(days=10)
                )
                Grade.objects.create(
                    student=student,
                    evaluation=evaluation,
                    score=18.5
                )

        # Create Exchange Rate
        ExchangeRate.objects.get_or_create(rate=45.50)

        # Create Payment
        Payment.objects.get_or_create(
            student=student,
            concept='Mensualidad Octubre',
            defaults={
                'amount_usd': 50.00,
                'amount_bs': 50 * 45.50,
                'rate_applied': 45.50,
                'status': 'VERIFIED',
                'reference_number': '123456',
                'billing_name': 'Maria Perez',
                'billing_id': 'V-12345678',
                'billing_address': 'Calle Principal'
            }
        )

        self.stdout.write(self.style.SUCCESS('Data seeded successfully'))
