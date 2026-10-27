from rest_framework import serializers


class MarketPriceSerializer(serializers.Serializer):
    id = serializers.CharField(required=False)
    market = serializers.CharField(max_length=120)
    district = serializers.CharField(max_length=100)
    commodity = serializers.CharField(max_length=100)
    modal_price = serializers.FloatField()
    min_price = serializers.FloatField(required=False, default=0)
    max_price = serializers.FloatField(required=False, default=0)
    arrival_quantity = serializers.FloatField(required=False, default=0)
    observed_on = serializers.DateField()


class LotSerializer(serializers.Serializer):
    id = serializers.CharField(required=False)
    commodity = serializers.CharField(max_length=100)
    quantity_kg = serializers.FloatField()
    quality = serializers.CharField(max_length=80)
    origin = serializers.CharField(max_length=120)
    asking_price = serializers.FloatField()
    available_on = serializers.DateField()
    status = serializers.ChoiceField(choices=["OPEN", "MATCHED", "SOLD"], default="OPEN")

    def validate_quantity_kg(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value


class BuyerRequirementSerializer(serializers.Serializer):
    buyer_name = serializers.CharField(max_length=160)
    commodity = serializers.CharField(max_length=100)
    min_quantity_kg = serializers.FloatField()
    max_quantity_kg = serializers.FloatField()
    quality = serializers.CharField(max_length=80)
    location = serializers.CharField(max_length=120)
    verified = serializers.BooleanField(default=False)


class OfferSerializer(serializers.Serializer):
    lot = serializers.CharField(max_length=120)
    buyer_name = serializers.CharField(max_length=160)
    price_per_quintal = serializers.FloatField()
    status = serializers.CharField(max_length=20, default="PENDING")


class GrievanceSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    category = serializers.CharField(max_length=60)
    status = serializers.CharField(max_length=30, default="OPEN")
