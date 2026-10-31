from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory

from market_api.market_data import fallback_market_data, load_locations, normalize_market
from datetime import date, timedelta

from market_api.services import calculate_logistics, calculate_recommendation, forecast_prices, match_buyers, recommendation_window


class RecommendationServiceTests(SimpleTestCase):
    def test_calculate_recommendation_prioritizes_best_net_realization(self):
        markets = [
            {"id": "nashik", "name": "Nashik APMC", "district": "Nashik", "price": 2850, "trend": 6.8, "arrival": 4210, "distance": 18, "demand": "High", "confidence": 82},
            {"id": "lasalgaon", "name": "Lasalgaon Market", "district": "Nashik", "price": 2920, "trend": 4.2, "arrival": 3650, "distance": 34, "demand": "High", "confidence": 78},
            {"id": "pimpalgaon", "name": "Pimpalgaon Baswant", "district": "Nashik", "price": 2760, "trend": 8.9, "arrival": 2980, "distance": 42, "demand": "Medium", "confidence": 74},
        ]

        result = calculate_recommendation(
            markets=markets,
            quantity_kg=5000,
            transport_rate=38,
            storage_days=0,
            storage_rate=4.5,
        )

        self.assertEqual(result["recommendation"]["market"], "Nashik APMC")
        self.assertEqual(result["recommendation"]["confidence"], 82)
        self.assertEqual(len(result["options"]), 3)
        self.assertEqual(result["options"][0]["name"], "Nashik APMC")
        self.assertEqual(result["recommendation"]["today"], date.today().isoformat())
        self.assertEqual(
            result["recommendation"]["window_end"],
            (date.today() + timedelta(days=3)).isoformat(),
        )

    def test_recommendation_window_is_today_through_three_days(self):
        result = recommendation_window(date(2026, 11, 1))

        self.assertEqual(result["today"], "2026-11-01")
        self.assertEqual(result["window_start"], "2026-11-01")
        self.assertEqual(result["window_end"], "2026-11-04")
        self.assertEqual(result["window"], "01 Nov - 04 Nov 2026")

    def test_calculate_recommendation_rejects_non_positive_quantity(self):
        with self.assertRaises(ValueError):
            calculate_recommendation(
                markets=[{"id": "nashik", "name": "Nashik APMC", "district": "Nashik", "price": 2850, "trend": 6.8, "arrival": 4210, "distance": 18, "demand": "High", "confidence": 82}],
                quantity_kg=0,
            )


class MarketDataTests(SimpleTestCase):
    def test_locations_include_dataset_states_and_districts(self):
        locations = load_locations()

        self.assertIn("Maharashtra", locations)
        self.assertTrue(locations["Maharashtra"])

    def test_normalize_market_maps_data_gov_fields(self):
        market = normalize_market(
            {
                "market": "Lasalgaon",
                "district": "Nashik",
                "commodity": "Onion",
                "modal_price": "2,920",
                "min_price": "2,700",
                "max_price": "3,100",
                "arrival_quantity": "3650",
                "arrival_date": "31/10/2026",
            },
            0,
        )

        self.assertEqual(market["name"], "Lasalgaon")
        self.assertEqual(market["price"], 2920)
        self.assertEqual(market["arrival"], 3650)
        self.assertEqual(market["distance"], 34)

    def test_fallback_supports_any_commodity(self):
        markets = fallback_market_data("Onion")

        self.assertTrue(markets)
        self.assertTrue(all(market["commodity"] == "Onion" for market in markets))


class MvpServiceTests(SimpleTestCase):
    def test_public_markets_endpoint_does_not_require_auth_models(self):
        from market_api.views import markets

        response = markets(APIRequestFactory().get("/api/markets/?commodity=Tomato"))

        self.assertEqual(response.status_code, 200)
        self.assertIn("markets", response.data)

    def test_forecast_returns_required_horizons(self):
        result = forecast_prices([100, 110, 120, 130, 140])

        self.assertEqual(result["forecasts"]["1_day"], 140)
        self.assertIn("3_day", result["forecasts"])

    def test_match_buyers_scores_quality_and_verification(self):
        result = match_buyers(
            {"commodity": "Tomato", "quantity_kg": 5000, "quality": "Grade A"},
            [{
                "buyer_name": "FreshKart",
                "commodity": "Tomato",
                "min_quantity_kg": 1000,
                "max_quantity_kg": 10000,
                "quality": "Grade A",
                "verified": True,
            }],
        )

        self.assertEqual(result[0]["match"], 100)

    def test_logistics_returns_transport_and_storage_costs(self):
        result = calculate_logistics(5000, 20, storage_days=2)

        self.assertGreater(result["transport_cost"], 0)
        self.assertGreater(result["storage_cost"], 0)
