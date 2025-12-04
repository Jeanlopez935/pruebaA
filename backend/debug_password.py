import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from core.serializers import UserSerializer
from users.models import CustomUser

def test_create_user():
    print("Testing User Creation...")
    data = {
        'username': 'test_vis_pass',
        'password': 'password123',
        'first_name': 'Test',
        'last_name': 'User',
        'role': 'REPRESENTANTE'
    }
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        print(f"User created: {user.username}")
        print(f"Visible Password: {user.visible_password}")
        
        if user.visible_password == 'password123':
            print("SUCCESS: Visible password saved on create.")
        else:
            print("FAILURE: Visible password NOT saved on create.")
            
        return user
    else:
        print("Serializer errors:", serializer.errors)
        return None

def test_update_user(user):
    print("\nTesting User Update...")
    data = {
        'password': 'newpassword456'
    }
    serializer = UserSerializer(user, data=data, partial=True)
    if serializer.is_valid():
        user = serializer.save()
        print(f"User updated: {user.username}")
        print(f"Visible Password: {user.visible_password}")
        
        if user.visible_password == 'newpassword456':
            print("SUCCESS: Visible password saved on update.")
        else:
            print("FAILURE: Visible password NOT saved on update.")
    else:
        print("Serializer errors:", serializer.errors)

if __name__ == '__main__':
    try:
        # Clean up previous test
        CustomUser.objects.filter(username='test_vis_pass').delete()
        
        user = test_create_user()
        if user:
            test_update_user(user)
            # Clean up
            user.delete()
    except Exception as e:
        print(f"An error occurred: {e}")
