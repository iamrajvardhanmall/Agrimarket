from datetime import date

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import BuyerRequirementSerializer, GrievanceSerializer, LotSerializer, MarketPriceSerializer, OfferSerializer
from .services import calculate_recommendation


MARKETS = [
    {"id": "nashik", "name": "Nashik APMC", "district": "Nashik", "price": 2850, "trend": 6.8, "arrival": 4210, "distance": 18, "demand": "High", "confidence": 82},
    {"id": "lasalgaon", "name": "Lasalgaon Market", "district": "Nashik", "price": 2920, "trend": 4.2, "arrival": 3650, "distance": 34, "demand": "High", "confidence": 78},
    {"id": "pimpalgaon", "name": "Pimpalgaon Baswant", "district": "Nashik", "price": 2760, "trend": 8.9, "arrival": 2980, "distance": 42, "demand": "Medium", "confidence": 74},
    {"id": "manmad", "name": "Manmad Yard", "district": "Nashik", "price": 2680, "trend": 2.1, "arrival": 5120, "distance": 61, "demand": "Medium", "confidence": 69},
]


@api_view(["GET"])
def health(request):
    return Response({"status": "ok", "service": "agrimarket-api"})


@api_view(["GET"])
def markets(request):
    commodity = request.query_params.get("commodity", "Tomato")
    sample = [{**market, "market": market["name"]} for market in MARKETS]
    serializer = MarketPriceSerializer(data=sample, many=True)
    if serializer.is_valid():
        return Response({"commodity": commodity, "observed_on": str(date.today()), "markets": sample})
    return Response({"commodity": commodity, "observed_on": str(date.today()), "markets": sample})


@api_view(["POST"])
def recommendations(request):
    try:
        quantity_kg = float(request.data.get("quantity_kg", 5000))
        transport_rate = float(request.data.get("transport_rate", 38))
        storage_days = float(request.data.get("storage_days", 0))
        storage_rate = float(request.data.get("storage_rate", 4.5))
        result = calculate_recommendation(MARKETS, quantity_kg, transport_rate, storage_days, storage_rate)
        return Response(result)
    except ValueError as exc:
        return Response({"error": str(exc)}, status=400)
    except TypeError:
        return Response({"error": "Invalid recommendation payload."}, status=400)


@api_view(["GET", "POST"])
def lots(request):
    if request.method == "POST":
        payload = request.data.copy()
        lot_data = {
            "commodity": payload.get("commodity", "Tomato"),
            "quantity_kg": payload.get("quantity_kg", 5000),
            "quality": payload.get("quality", "Grade A"),
            "origin": payload.get("origin", "Nashik"),
            "asking_price": payload.get("asking_price", 2800),
            "available_on": payload.get("available_on", str(date.today())),
            "status": payload.get("status", "OPEN"),
        }
        serializer = LotSerializer(data=lot_data)
        serializer.is_valid(raise_exception=True)
        lot = serializer.validated_data
        lot.update({"id": "AGRI-10427", "created_at": str(date.today())})
        return Response(lot, status=201)
    return Response({"lots": [{"id": "AGRI-10245", "commodity": "Tomato", "quantity_kg": 5000, "quality": "Grade A", "asking_price": 2800, "offers": 3, "status": "OPEN"}]})


@api_view(["GET", "POST"])
def buyers(request):
    buyers_payload = [{"name": "FreshKart Foods", "match": 94, "verified": True, "demand": "8-12 tonnes", "location": "Pune"}, {"name": "Sahyadri Processors", "match": 87, "verified": True, "demand": "5-8 tonnes", "location": "Nashik"}, {"name": "GreenBasket Retail", "match": 79, "verified": False, "demand": "3-5 tonnes", "location": "Mumbai"}]
    if request.method == "POST":
        serializer = BuyerRequirementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=201)
    return Response({"buyers": buyers_payload})


@api_view(["GET", "POST"])
def offers(request):
    payload = [{"buyer": "FreshKart Foods", "price": 2975, "lot": "AGRI-10245", "status": "PENDING"}, {"buyer": "Sahyadri Processors", "price": 2920, "lot": "AGRI-10245", "status": "PENDING"}, {"buyer": "GreenBasket Retail", "price": 2865, "lot": "AGRI-10245", "status": "PENDING"}]
    if request.method == "POST":
        serializer = OfferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=201)
    return Response({"offers": payload})


@api_view(["GET", "POST"])
def grievances(request):
    if request.method == "POST":
        serializer = GrievanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=201)
    return Response({"grievances": [{"id": 1, "title": "Payment delay", "category": "Finance", "status": "OPEN"}]})
