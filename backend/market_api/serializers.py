from rest_framework import serializers

from .models import BuyerRequirement, Grievance, Lot, MarketPrice, Offer


class MarketPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketPrice
        fields = [
            "id",
            "market",
            "district",
            "commodity",
            "modal_price",
            "min_price",
            "max_price",
            "arrival_quantity",
            "observed_on",
        ]


class LotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lot
        fields = [
            "id",
            "commodity",
            "quantity_kg",
            "quality",
            "origin",
            "asking_price",
            "available_on",
            "status",
        ]

    def validate_quantity_kg(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value


class BuyerRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerRequirement
        fields = [
            "id",
            "buyer_name",
            "commodity",
            "min_quantity_kg",
            "max_quantity_kg",
            "quality",
            "location",
            "verified",
        ]


class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = ["id", "lot", "buyer_name", "price_per_quintal", "status"]


class GrievanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grievance
        fields = ["id", "title", "category", "status", "created_at"]
