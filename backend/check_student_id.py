import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from academic.models import Student

students = Student.objects.filter(first_name__icontains='Pedro', last_name__icontains='Perez')
print(f"Found {students.count()} students matching 'Pedro Perez'")

for s in students:
    print(f"ID: {s.id}, Name: {s.first_name} {s.last_name}, ID Number: '{s.id_number}'")
