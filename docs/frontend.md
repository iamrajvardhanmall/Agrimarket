# Frontend

## Purpose

The frontend is a React dashboard for farmer decision support. It is designed to make market comparison, recommendation assumptions, buyer matches, and offers scannable on desktop and mobile.

## Stack

- React and JavaScript
- Vite for development and production builds
- Tailwind CSS layers with the existing custom CSS theme
- Plotly.js Basic Distribution for the market trend chart
- Native SVG for the buyer-market network visualization

## Main entry points

- `frontend/src/main.jsx`: mounts the React application.
- `frontend/src/App.jsx`: dashboard state, API calls, recommendation interaction, buyer view, and Plotly chart.
- `frontend/src/styles.css`: responsive layout, colors, typography, and component styling.
- `frontend/tailwind.config.js`: Tailwind content paths.
- `frontend/postcss.config.js`: Tailwind and Autoprefixer processing.

## Current dashboard behavior

1. Loads demo market and buyer data immediately.
2. Attempts to load markets and buyers from Django at `http://localhost:8000/api/`.
3. Falls back to demo data when the API is unavailable.
4. Accepts commodity, quantity, and quality inputs.
5. Posts recommendation inputs to `/api/recommendations/`.
6. Ranks markets by expected net realization.
7. Shows the price trend with a lazy-loaded Plotly chart.
8. Displays matched buyers and recent offers.
9. Renders market and buyer nodes with weighted match links from `frontend/src/graphData.js`.

## Plotly chart

The chart uses a line and marker trace with:

- Date labels on the X axis
- Rupee-formatted prices on the Y axis
- Responsive sizing
- Hidden mode bar for a clean dashboard surface
- `Plotly.purge` cleanup on component teardown

The basic Plotly distribution is dynamically imported to keep the initial application bundle smaller.

## Frontend extension points

- Replace hardcoded demo offers with `/api/offers/` data.
- Add React routes for farmer, FPO, buyer, and admin areas.
- Add authenticated API client and token handling.
- Add Plotly charts for arrivals, volatility, buyer demand, and transaction metrics.
- Add map visualization for markets, warehouses, farms, and transport routes.
- Add localization for English, Hindi, Marathi, and Punjabi when deployment requirements are confirmed.

## Build and fallback behavior

Run `npm run build` from `frontend/` to produce the Vite production bundle. The dashboard starts with local demo data and replaces it with successful API responses; failed requests do not prevent the main decision workflow from rendering.
