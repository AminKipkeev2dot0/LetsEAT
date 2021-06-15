from django.urls import path, include

from . import views


urlpatterns = [
    path('', include('django_registration.backends.activation.urls')),
    path('login/', views.Login.as_view(), name='login'),
    path('', include('django.contrib.auth.urls')),

]
