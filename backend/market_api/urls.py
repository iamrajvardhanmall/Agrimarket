from django.urls import path
from . import views

urlpatterns = [
    path("health/", views.health),
    path("markets/", views.markets),
    path("locations/", views.locations),
    path("recommendations/", views.recommendations),
    path("lots/", views.lots),
    path("opportunities/", views.opportunities),
    path("offers/", views.offers),
    path("grievances/", views.grievances),
    path("forecasts/", views.forecasts),
    path("ml/insights/", views.ml_insights),
    path("logistics/", views.logistics),
    path("analytics/", views.analytics),
    path("transactions/", views.transactions),
]
