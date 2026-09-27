from django.urls import path
from . import views

urlpatterns = [
    path("health/", views.health),
    path("markets/", views.markets),
    path("recommendations/", views.recommendations),
    path("lots/", views.lots),
    path("buyers/", views.buyers),
    path("offers/", views.offers),
]
