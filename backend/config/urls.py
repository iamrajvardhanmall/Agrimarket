from django.urls import include, path

urlpatterns = [
    path("api/", include("market_api.urls")),
]
