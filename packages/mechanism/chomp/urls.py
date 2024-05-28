from django.urls import path

from chomp.views import index


urlpatterns = [
    path('', index),
]