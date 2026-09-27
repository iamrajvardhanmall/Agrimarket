# Graph Analytics and Visualization

## Purpose

This project uses simple, readable Python-based visualization libraries to analyze agricultural market trends and compare performance across markets, crops, and time periods.

## Primary tools

- GraphX for distributed graph analytics and market-network relationships
- NetworkX for local Python graph experiments and visualization
- Matplotlib for custom charts and static market visuals
- Seaborn for cleaner statistical and comparative data plots

## Typical analysis views

- Commodity price trends over days or weeks
- Comparison of market modal prices across districts
- Arrival volume and demand patterns by market
- Forecast vs. observed values for price movement
- Distribution of price ranges and volatility across markets

## Current implementation boundary

The project keeps visualization and exploratory analysis lightweight and Python-based while preparing for larger graph-processing workloads. For local development, NetworkX is used in the graph boundary for buyer-market relationship modeling; for larger distributed graph use cases, GraphX is the intended scale-up path.

## Recommended usage

- Use GraphX for distributed graph analytics and large-scale network computations
- Use NetworkX for local graph experiments, prototypes, and market-buyer relationship mapping
- Use Matplotlib for line plots, bar charts, and price overlays
- Use Seaborn for trend summaries, grouped comparisons, and readable market visuals
- Export charts for reports or ML analysis notebooks
- Keep all charts tied to a clear business question such as "which market offers the best realized value?"

Visualization outputs are analytical aids and should be interpreted alongside real market verification and buyer quality checks.

## Current implementation

`graph/market_graph.py` exposes `build_market_graph`, `summarize_graph`, and `plot_market_graph` for local Python analysis. It links market nodes to buyer nodes when the buyer match score is at least 70. The React dashboard renders the current demo graph as an SVG network using `frontend/src/graphData.js`.
