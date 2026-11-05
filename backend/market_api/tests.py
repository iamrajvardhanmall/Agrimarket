from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory

from market_api.market_data import fallback_market_data, load_locations, normalize_market
from datetime import date, timedelta

from market_api.services import calculate_logistics, calculate_recommendation, discover_selling_opportunities, forecast_prices, recommendation_window


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
        self.assertGreaterEqual(result["recommendation"]["confidence"], 0)
        self.assertLessEqual(result["recommendation"]["confidence"], 100)
        self.assertEqual(
            result["recommendation"]["decision_model"],
            "Linear Regression + Decision Tree Regressor ensemble",
        )
        self.assertEqual(len(result["options"]), 3)
        self.assertEqual(result["options"][0]["name"], "Nashik APMC")
        self.assertEqual([option["rank"] for option in result["options"]], [1, 2, 3])
        self.assertEqual(result["ranking"]["highest_profit_route"]["market"], "Nashik APMC")
        self.assertEqual(
            result["ranking"]["highest_profit_route"]["net_realization"],
            result["options"][0]["net_realization"],
        )
        self.assertTrue(result["options"][0]["logistics_suitable"])
        self.assertEqual(
            {option["type"] for option in result["decision_options"]},
            {"sell_now", "store_and_sell_later", "alternate_market"},
        )
        self.assertIn(result["recommendation"]["type"], {"sell_now", "store_and_sell_later", "alternate_market"})
        self.assertEqual(
            result["decision_model"]["algorithms"],
            ["linear_regression", "decision_tree"],
        )
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
        markets = fallback_market_data("Tomato")

        self.assertTrue(markets)
        self.assertTrue(all("price" in m and m["price"] > 0 for m in markets))

    def test_fallback_includes_price_discovery_metrics_and_filters(self):
        markets = fallback_market_data(
            commodity="Tomato",
            state="Maharashtra",
        )

        self.assertGreater(len(markets), 0)
        for m in markets:
            self.assertIn("min_price", m)
            self.assertIn("max_price", m)
            self.assertIn("arrival_quantity", m)
            self.assertGreater(m["price"], 0)


class MvpServiceTests(SimpleTestCase):
    def test_selling_opportunities_match_farmer_criteria(self):
        result = discover_selling_opportunities(
            commodity="Onion",
            quantity_kg=5000,
            quality="Grade A",
            state="Maharashtra",
            district="Nashik",
            delivery="Scheduled pickup",
        )

        self.assertEqual(result[0]["name"], "Lasalgaon scheduled sale")
        self.assertEqual(result[0]["match_score"], 99)
        self.assertTrue(result[0]["verified"])
        self.assertIn("delivery", result[0])

    def test_public_markets_endpoint_does_not_require_auth_models(self):
        from market_api.views import markets

        response = markets(APIRequestFactory().get("/api/markets/?commodity=Tomato"))

        self.assertEqual(response.status_code, 200)
        self.assertIn("markets", response.data)

    def test_forecast_returns_required_horizons(self):
        result = forecast_prices([100, 110, 120, 130, 140, 150, 160, 170])

        self.assertEqual(result["forecasts"]["1_day"], 170)
        self.assertEqual(result["forecasts"]["3_day"], 160)
        self.assertEqual(sorted(result["forecasts"]), [f"{day}_day" for day in range(1, 8)])
        self.assertIn("mae", result["evaluation"]["3_day"])
        self.assertEqual(
            sorted(result["evaluation"]),
            [f"{day}_day" for day in range(1, 8)],
        )

    def test_logistics_returns_transport_and_storage_costs(self):
        result = calculate_logistics(5000, 20, storage_days=2)

        self.assertGreater(result["transport_cost"], 0)
        self.assertGreater(result["storage_cost"], 0)
        self.assertEqual(result["total_cost"], result["transport_cost"] + result["storage_cost"])
        self.assertTrue(result["suitable"])
        self.assertTrue(result["suitability_reasons"])

    def test_logistics_marks_long_route_or_storage_as_unsuitable(self):
        result = calculate_logistics(5000, 120, storage_days=31)

        self.assertFalse(result["suitable"])
        self.assertEqual(len(result["suitability_reasons"]), 2)

    def test_analytics_summarizes_farmer_outcomes(self):
        from market_api.services import summarize_analytics

        result = summarize_analytics({
            "lots": [{"status": "OPEN"}, {"status": "SOLD"}],
            "offers": [{"status": "PENDING"}, {"status": "ACCEPTED"}],
            "grievances": [],
            "transactions": [
                {"delivery_status": "DELIVERED", "payment_status": "PAID", "amount": 125000},
                {"delivery_status": "PLANNED", "payment_status": "PENDING", "amount": 90000},
            ],
        })

        self.assertEqual(result["transactions"], 2)
        self.assertEqual(result["delivered_transactions"], 1)
        self.assertEqual(result["paid_transactions"], 1)
        self.assertEqual(result["total_sales_amount"], 215000)

    def test_ml_training_exposes_syllabus_algorithms_and_metrics(self):
        from ml.market_models import train_models

        records = [{
            "state": "Maharashtra",
            "commodity": "Onion",
            "variety": "FAQ",
            "grade": "A",
            "min_price": 1000 + index * 10,
            "max_price": 1200 + index * 10,
            "modal_price": 1100 + index * 10,
            "arrival_quantity": 100 + index,
            "month": (index % 12) + 1,
            "day_of_year": index + 1,
        } for index in range(40)]
        result = train_models(records)

        self.assertIn("logistic_regression", result["classification"]["models"])
        self.assertIn("svm", result["classification"]["models"])
        self.assertIn("naive_bayes", result["classification"]["models"])
        self.assertIn("r2", result["regression"]["linear_regression"])
        self.assertIn("correlation", result)
