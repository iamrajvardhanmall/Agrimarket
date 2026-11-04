from datetime import date
from pathlib import Path
from uuid import uuid4

from pymongo.errors import PyMongoError
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .db import check_connection, insert_document, list_documents
from .market_data import fetch_market_data, load_locations, load_dataset_metadata
from .serializers import GrievanceSerializer, LotSerializer, OfferSerializer
from .services import (
    calculate_logistics, calculate_recommendation, discover_selling_opportunities,
    forecast_prices, forecast_market_prices, summarize_analytics,
)
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


@api_view(["GET"])
def forecast_metadata(request):
    """Return all filterable options for the conditioned forecast UI."""
    meta = load_dataset_metadata()
    return Response({
        "commodities": meta.get("commodities", []),
        "grades": meta.get("grades", []),
        "markets_by_district": meta.get("markets_by_district", {}),
        "locations": meta.get("locations", {}),
    })


@api_view(["GET"])
def conditioned_forecast(request):
    """
    Conditioned price forecast using Dataset.csv filtered by:
    state, district, market, commodity, variety, grade
    """
    try:
        result = forecast_market_prices(
            state=request.query_params.get("state") or None,
            district=request.query_params.get("district") or None,
            market=request.query_params.get("market") or None,
            commodity=request.query_params.get("commodity") or None,
            variety=request.query_params.get("variety") or None,
            grade=request.query_params.get("grade") or None,
        )
        return Response(result)
    except (TypeError, ValueError) as exc:
        return Response({"error": str(exc)}, status=400)


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


@api_view(["GET"])
def opportunities(request):
    try:
        result = discover_selling_opportunities(
            commodity=request.query_params.get("commodity"),
            quantity_kg=float(request.query_params.get("quantity_kg", 5000)),
            quality=request.query_params.get("quality"),
            state=request.query_params.get("state"),
            district=request.query_params.get("district"),
            delivery=request.query_params.get("delivery"),
        )
        return Response({"opportunities": result})
    except (TypeError, ValueError) as exc:
        return Response({"error": str(exc)}, status=400)


@api_view(["GET", "POST"])
def offers(request):
    payload = [{"offer_source": "Market offer", "price": 2975, "lot": "AGRI-10245", "status": "PENDING"}, {"offer_source": "Market offer", "price": 2920, "lot": "AGRI-10245", "status": "PENDING"}]
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
            for name in ("lots", "offers", "grievances", "transactions")
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
