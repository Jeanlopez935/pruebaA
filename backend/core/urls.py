from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthViewSet, StudentViewSet, TeacherViewSet, 
    SubjectViewSet, GradeViewSet, PaymentViewSet, ExchangeRateViewSet,
    EvaluationViewSet, UserViewSet, PaymentConceptViewSet, ScheduleViewSet
)

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'teachers', TeacherViewSet, basename='teacher')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'evaluations', EvaluationViewSet, basename='evaluation')
router.register(r'grades', GradeViewSet, basename='grade')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'rates', ExchangeRateViewSet, basename='exchangerate')
router.register(r'payment-concepts', PaymentConceptViewSet, basename='paymentconcept')
router.register(r'schedules', ScheduleViewSet, basename='schedule')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
