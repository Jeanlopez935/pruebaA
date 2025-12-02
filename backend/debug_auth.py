import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import authenticate, get_user_model

User = get_user_model()
print(f"User Model: {User}")

username = 'admin'
password = '1234'

user = authenticate(username=username, password=password)
if user:
    print(f"Authentication SUCCESS for {username}")
else:
    print(f"Authentication FAILED for {username}")
    try:
        u = User.objects.get(username=username)
        print(f"User found in DB. Active: {u.is_active}. Check password hash.")
        print(f"Check password result: {u.check_password(password)}")
    except User.DoesNotExist:
        print("User NOT found in DB")
