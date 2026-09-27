from django.db import models


class MarketPrice(models.Model):
    market = models.CharField(max_length=120)
    district = models.CharField(max_length=100)
    commodity = models.CharField(max_length=100)
    modal_price = models.DecimalField(max_digits=10, decimal_places=2)
    min_price = models.DecimalField(max_digits=10, decimal_places=2)
    max_price = models.DecimalField(max_digits=10, decimal_places=2)
    arrival_quantity = models.FloatField(default=0)
    observed_on = models.DateField()


class Lot(models.Model):
    STATUS_CHOICES = [("OPEN", "Open"), ("MATCHED", "Matched"), ("SOLD", "Sold")]
    commodity = models.CharField(max_length=100)
    quantity_kg = models.FloatField()
    quality = models.CharField(max_length=80)
    origin = models.CharField(max_length=120)
    asking_price = models.DecimalField(max_digits=10, decimal_places=2)
    available_on = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="OPEN")


class BuyerRequirement(models.Model):
    buyer_name = models.CharField(max_length=160)
    commodity = models.CharField(max_length=100)
    min_quantity_kg = models.FloatField()
    max_quantity_kg = models.FloatField()
    quality = models.CharField(max_length=80)
    location = models.CharField(max_length=120)
    verified = models.BooleanField(default=False)


class Offer(models.Model):
    lot = models.ForeignKey(Lot, on_delete=models.CASCADE, related_name="offers")
    buyer_name = models.CharField(max_length=160)
    price_per_quintal = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default="PENDING")


class Grievance(models.Model):
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=60)
    status = models.CharField(max_length=30, default="OPEN")
    created_at = models.DateTimeField(auto_now_add=True)
