from datetime import date
from pathlib import Path
from uuid import uuid4

from pymongo.errors import PyMongoError
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .db import check_connection, insert_document, list_documents
from .market_data import fetch_market_data, load_locations
from .serializers import BuyerRequirementSerializer, GrievanceSerializer, LotSerializer, OfferSerializer
from .services import calculate_logistics, calculate_recommendation, forecast_prices, match_buyers, summarize_analytics
from .serializers import TransactionSerializer


@api_view(["GET"])
def health(request):
    try:
        check_connection()
    except PyMongoError:
        return Response({"status": "error", "service": "agrimarket-api", "database": "unavailable"}, status=503)
    return Response({"status": "ok", "service": "agrimarket-api", "database": "mongodb"})


@api_view(["GET"])
def markets(request):
    commodity = request.query_params.get("commodity")
    filters = {key: request.query_params.get(key) for key in ("district", "state", "market", "commodity_group", "variety")}
    markets = fetch_market_data(commodity=commodity, **filters)
    return Response({"commodity": commodity, "observed_on": str(date.today()), "markets": markets})


@api_view(["GET"])
def locations(request):
    return Response({"locations": load_locations()})


@api_view(["POST"])
def recommendations(request):
    try:
        commodity = request.data.get("commodity") or None
        markets = fetch_market_data(
            commodity=commodity,
            state=request.data.get("state"),
            district=request.data.get("district"),
            market=request.data.get("market"),
            commodity_group=request.data.get("commodity_group"),
            variety=request.data.get("variety"),
        )
        quantity_kg = float(request.data.get("quantity_kg", 5000))
        transport_rate = float(request.data.get("transport_rate", 38))
        storage_days = float(request.data.get("storage_days", 0))
        storage_rate = float(request.data.get("storage_rate", 4.5))
        result = calculate_recommendation(markets, quantity_kg, transport_rate, storage_days, storage_rate)
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
            "commodity": payload.get("commodity", "Unspecified commodity"),
            "quantity_kg": payload.get("quantity_kg", 5000),
            "quality": payload.get("quality", "Grade A"),
            "origin": payload.get("origin", "Unspecified origin"),
            "asking_price": payload.get("asking_price", 2800),
            "available_on": payload.get("available_on", str(date.today())),
            "status": payload.get("status", "OPEN"),
        }
        serializer = LotSerializer(data=lot_data)
        serializer.is_valid(raise_exception=True)
        lot = {
            **serializer.validated_data,
            "id": f"AGRI-{uuid4().hex[:8].upper()}",
            "created_at": str(date.today()),
        }
        try:
            return Response(insert_document("lots", lot), status=201)
        except PyMongoError:
            return Response({"error": "MongoDB is unavailable."}, status=503)
    try:
        return Response({"lots": list_documents("lots")})
    except PyMongoError:
        return Response({"lots": [{"id": "AGRI-10245", "commodity": "Tomato", "quantity_kg": 5000, "quality": "Grade A", "asking_price": 2800, "offers": 3, "status": "OPEN"}]})


@api_view(["GET", "POST"])
def buyers(request):
    buyers_payload = [{"name": "FreshKart Foods", "match": 94, "verified": True, "demand": "8-12 tonnes", "location": "Pune"}, {"name": "Sahyadri Processors", "match": 87, "verified": True, "demand": "5-8 tonnes", "location": "Nashik"}, {"name": "GreenBasket Retail", "match": 79, "verified": False, "demand": "3-5 tonnes", "location": "Mumbai"}]
    if request.method == "POST":
        serializer = BuyerRequirementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            return Response(insert_document("buyer_requirements", serializer.validated_data), status=201)
        except PyMongoError:
            return Response({"error": "MongoDB is unavailable."}, status=503)
    try:
        stored = list_documents("buyer_requirements")
        return Response({"buyers": stored or buyers_payload})
    except PyMongoError:
        return Response({"buyers": buyers_payload})


@api_view(["POST"])
def matches(request):
    lot = request.data.copy()
    try:
        buyers_data = list_documents("buyer_requirements")
        return Response({"matches": match_buyers(lot, buyers_data)})
    except PyMongoError:
        return Response({"matches": []})


@api_view(["POST"])
def aggregations(request):
    lot_ids = request.data.get("lot_ids", [])
    if not isinstance(lot_ids, list) or not lot_ids:
        return Response({"error": "lot_ids must be a non-empty list."}, status=400)
    try:
        lots_data = list_documents("lots")
        selected = [lot for lot in lots_data if lot.get("id") in lot_ids]
        if not selected:
            return Response({"error": "No matching lots found."}, status=404)
        return Response({
            "commodity": selected[0].get("commodity"),
            "quality": selected[0].get("quality"),
            "lot_ids": lot_ids,
            "quantity_kg": sum(float(lot.get("quantity_kg", 0)) for lot in selected),
            "lot_count": len(selected),
            "status": "OPEN",
        }, status=201)
    except PyMongoError:
        return Response({"error": "MongoDB is unavailable."}, status=503)


@api_view(["GET", "POST"])
def offers(request):
    payload = [{"buyer": "FreshKart Foods", "price": 2975, "lot": "AGRI-10245", "status": "PENDING"}, {"buyer": "Sahyadri Processors", "price": 2920, "lot": "AGRI-10245", "status": "PENDING"}, {"buyer": "GreenBasket Retail", "price": 2865, "lot": "AGRI-10245", "status": "PENDING"}]
    if request.method == "POST":
        serializer = OfferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            return Response(insert_document("offers", serializer.validated_data), status=201)
        except PyMongoError:
            return Response({"error": "MongoDB is unavailable."}, status=503)
    try:
        stored = list_documents("offers")
        return Response({"offers": stored or payload})
    except PyMongoError:
        return Response({"offers": payload})


@api_view(["GET", "POST"])
def grievances(request):
    if request.method == "POST":
        serializer = GrievanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        grievance = {**serializer.validated_data, "created_at": str(date.today())}
        try:
            return Response(insert_document("grievances", grievance), status=201)
        except PyMongoError:
            return Response({"error": "MongoDB is unavailable."}, status=503)
    try:
        return Response({"grievances": list_documents("grievances")})
    except PyMongoError:
        return Response({"grievances": []})


@api_view(["POST"])
def forecasts(request):
    try:
        prices = [float(value) for value in request.data.get("prices", [])]
        return Response(forecast_prices(prices))
    except (TypeError, ValueError) as exc:
        return Response({"error": str(exc)}, status=400)


@api_view(["GET"])
def ml_insights(request):
    dataset = request.query_params.get(
        "dataset",
        str(Path(__file__).resolve().parents[2] / "data_engine" / "Dataset.csv"),
    )
    try:
        from ml.market_models import train_dataset

        return Response(train_dataset(dataset))
    except (OSError, ValueError, ImportError) as exc:
        return Response({"error": f"ML training unavailable: {exc}"}, status=503)


@api_view(["POST"])
def logistics(request):
    try:
        result = calculate_logistics(
            quantity_kg=float(request.data.get("quantity_kg", 0)),
            distance_km=float(request.data.get("distance_km", 0)),
            transport_rate=float(request.data.get("transport_rate", 38)),
            storage_days=float(request.data.get("storage_days", 0)),
            storage_rate=float(request.data.get("storage_rate", 4.5)),
        )
        return Response(result)
    except (TypeError, ValueError) as exc:
        return Response({"error": str(exc)}, status=400)


@api_view(["GET"])
def analytics(request):
    try:
        collections = {
            name: list_documents(name)
            for name in ("lots", "offers", "grievances")
        }
        return Response(summarize_analytics(collections))
    except PyMongoError:
        return Response(summarize_analytics({}))


@api_view(["GET", "POST"])
def transactions(request):
    if request.method == "POST":
        serializer = TransactionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = {
            **serializer.validated_data,
            "created_at": str(date.today()),
        }
        try:
            return Response(insert_document("transactions", transaction), status=201)
        except PyMongoError:
            return Response({"error": "MongoDB is unavailable."}, status=503)
    try:
        return Response({"transactions": list_documents("transactions")})
    except PyMongoError:
        return Response({"transactions": []})
