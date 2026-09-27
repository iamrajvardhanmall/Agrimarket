from django.test import SimpleTestCase

from market_api.services import calculate_recommendation


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

    def test_calculate_recommendation_rejects_non_positive_quantity(self):
        with self.assertRaises(ValueError):
            calculate_recommendation(
                markets=[{"id": "nashik", "name": "Nashik APMC", "district": "Nashik", "price": 2850, "trend": 6.8, "arrival": 4210, "distance": 18, "demand": "High", "confidence": 82}],
                quantity_kg=0,
            )
