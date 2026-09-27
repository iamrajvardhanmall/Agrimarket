"""Market graph analysis for AgriMarket AI.

This module creates a lightweight buyer-market graph that mirrors the kind of
network analysis typically handled by Spark GraphX in a distributed pipeline.
For local development and experimentation, we use NetworkX because it is easy to
run in Python and integrates well with Matplotlib-based visualization.
"""

from __future__ import annotations

from typing import Iterable

import matplotlib.pyplot as plt
import networkx as nx


def build_market_graph(markets: Iterable[dict], buyers: Iterable[dict]) -> nx.Graph:
    """Create a graph linking markets to buyer nodes through demand and match scores."""
    graph = nx.Graph()

    for market in markets:
        graph.add_node(
            market["name"],
            type="market",
            district=market.get("district", "Unknown"),
            price=market.get("price", 0),
            demand=market.get("demand", "Medium"),
            distance_km=market.get("distance", 0),
        )

    for buyer in buyers:
        graph.add_node(
            buyer["name"],
            type="buyer",
            verified=buyer.get("verified", False),
            match_score=buyer.get("match", 0),
            location=buyer.get("location", "Unknown"),
        )

    for market in markets:
        market_name = market["name"]
        for buyer in buyers:
            buyer_name = buyer["name"]
            match_score = buyer.get("match", 0)
            if match_score >= 70:
                graph.add_edge(market_name, buyer_name, weight=match_score, relation="buyer_match")

    return graph


def summarize_graph(graph: nx.Graph) -> dict:
    """Return a compact graph summary for a dashboard or notebook."""
    market_nodes = [node for node, attrs in graph.nodes(data=True) if attrs.get("type") == "market"]
    buyer_nodes = [node for node, attrs in graph.nodes(data=True) if attrs.get("type") == "buyer"]
    edges = graph.number_of_edges()

    return {
        "markets": len(market_nodes),
        "buyers": len(buyer_nodes),
        "connections": edges,
        "avg_degree": round(sum(dict(graph.degree()).values()) / max(graph.number_of_nodes(), 1), 2),
    }


def plot_market_graph(graph: nx.Graph, output_path: str | None = None) -> None:
    """Render a simple market-buyer graph to a PNG file."""
    market_nodes = [node for node, attrs in graph.nodes(data=True) if attrs.get("type") == "market"]
    buyer_nodes = [node for node, attrs in graph.nodes(data=True) if attrs.get("type") == "buyer"]

    pos = nx.spring_layout(graph, seed=42)
    plt.figure(figsize=(10, 7))
    nx.draw_networkx_nodes(graph, pos, nodelist=market_nodes, node_color="#186b50", node_size=700, label="Market")
    nx.draw_networkx_nodes(graph, pos, nodelist=buyer_nodes, node_color="#d7b56d", node_size=500, label="Buyer")
    nx.draw_networkx_edges(graph, pos, width=1.5, alpha=0.8)
    nx.draw_networkx_labels(graph, pos, font_size=9)
    plt.title("AgriMarket Buyer-Market Network")
    plt.tight_layout()

    if output_path:
        plt.savefig(output_path, dpi=200)
    plt.show()


if __name__ == "__main__":
    demo_markets = [
        {"name": "Nashik APMC", "district": "Nashik", "price": 2850, "demand": "High", "distance": 18},
        {"name": "Lasalgaon Market", "district": "Nashik", "price": 2920, "demand": "High", "distance": 34},
    ]
    demo_buyers = [
        {"name": "FreshKart Foods", "match": 94, "verified": True, "location": "Pune"},
        {"name": "Sahyadri Processors", "match": 87, "verified": True, "location": "Nashik"},
        {"name": "GreenBasket Retail", "match": 79, "verified": False, "location": "Mumbai"},
    ]

    graph = build_market_graph(demo_markets, demo_buyers)
    print(summarize_graph(graph))
