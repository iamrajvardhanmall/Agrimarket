import { useState, useCallback, useTransition, useMemo } from "react";
import { IconHome, IconSeed, IconChart, IconHelp, IconMenu } from "./components/common/Icons";
import { Toast } from "./components/common/Toast";
import { AboutTab } from "./components/tabs/AboutTab";
import { SellingPlanTab } from "./components/tabs/SellingPlanTab";
import { MarketsTab } from "./components/tabs/MarketsTab";
import { HelpTab } from "./components/tabs/HelpTab";
import { API_BASE_URL } from "./constants/config";
import { LANGS } from "./constants/translations";
import { states, demoMarkets } from "./constants/marketData";
import { useApi } from "./hooks/useApi";

export default function App() {
  const [lang, setLang] = useState("en");
  const [active, setActive] = useState(0); // 0: About (Home), 1: Selling Plan, 2: Markets, 3: Help
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");

  const t = LANGS[lang] || LANGS.en;

  /* ── Form inputs ── */
  const [commodity, setCommodity] = useState("Tomato");
  const [commodityGroup, setCommodityGroup] = useState("");
  const [variety, setVariety] = useState("FAQ");
  const [quantity, setQuantity] = useState("5000");
  const [quality, setQuality] = useState("Grade B");
  const [state, setState] = useState("Karnataka");
  const [district, setDistrict] = useState("");
  const [marketFilter, setMarketFilter] = useState("");
  const [transportRate, setTransportRate] = useState("38");
  const [storageDays, setStorageDays] = useState("0");
  const [storageRate, setStorageRate] = useState("4.5");
  const [deliveryPref, setDeliveryPref] = useState("Scheduled pickup");

  /* ── Location metadata ── */
  const locationsRes = useApi(`${API_BASE_URL}/locations/`, { locations: {} });
  const locationMap = useMemo(() => locationsRes.data?.locations || {}, [locationsRes.data]);
  const availableStates = useMemo(() => (Object.keys(locationMap).length ? Object.keys(locationMap).sort() : states), [locationMap]);
  const availableDistricts = useMemo(() => locationMap[state] || [], [locationMap, state]);

  /* ── State for markets & recommendations ── */
  const [markets, setMarkets] = useState(demoMarkets);
  const [recommendation, setRecommendation] = useState(null);
  const [decisionOptions, setDecisionOptions] = useState([]);
  const [ranking, setRanking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [isRecommendationPending, startTransition] = useTransition();

  /* ── Fetch initial market prices ── */
  const [marketsLoaded, setMarketsLoaded] = useState(false);
  const loadMarkets = useCallback(() => {
    const ac = new AbortController();
    const params = new URLSearchParams();
    if (state) params.set("state", state);
    if (district) params.set("district", district);
    if (commodity) params.set("commodity", commodity);
    if (variety) params.set("variety", variety);

    fetch(`${API_BASE_URL}/markets/?${params}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((d) => {
        if (d.markets?.length) {
          setMarkets(d.markets);
          setDataError("");
        }
      })
      .catch(() => {
        setDataError("Showing offline sample data.");
      })
      .finally(() => setMarketsLoaded(true));
    return () => ac.abort();
  }, [state, district, commodity, variety]);

  /* ── Fetch forecast for commodity ── */
  const [forecast, setForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const loadForecast = useCallback(() => {
    if (!commodity) return;
    setForecastLoading(true);
    fetch(`${API_BASE_URL}/forecasts/?commodity=${encodeURIComponent(commodity)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.forecast) setForecast(d.forecast);
      })
      .catch(() => {})
      .finally(() => setForecastLoading(false));
  }, [commodity]);

  /* ── Run AI recommendation calculation ── */
  const runRecommendation = useCallback(async () => {
    setLoading(true);
    setDataError("");

    const parsedQty = parseFloat(quantity);
    const qtyVal = Number.isFinite(parsedQty) && parsedQty > 0 ? parsedQty : 5000;

    const parsedTransport = parseFloat(transportRate);
    const transportVal = Number.isFinite(parsedTransport) && parsedTransport >= 0 ? parsedTransport : 38;

    const parsedStorageDays = parseFloat(storageDays);
    const storageDaysVal = Number.isFinite(parsedStorageDays) && parsedStorageDays >= 0 ? parsedStorageDays : 0;

    const parsedStorageRate = parseFloat(storageRate);
    const storageRateVal = Number.isFinite(parsedStorageRate) && parsedStorageRate >= 0 ? parsedStorageRate : 4.5;

    try {
      const r = await fetch(`${API_BASE_URL}/recommendations/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commodity,
          state,
          district,
          market: marketFilter,
          commodity_group: commodityGroup,
          variety,
          quantity: qtyVal,
          quantity_kg: qtyVal,
          quality,
          transport_rate: transportVal,
          transport_rate_per_km: transportVal,
          storage_days: storageDaysVal,
          storage_rate: storageRateVal,
          storage_rate_per_day: storageRateVal,
          delivery_preference: deliveryPref,
        }),
      });
      if (r.ok) {
        const d = await r.json();
        startTransition(() => {
          if (d.options?.length) setMarkets(d.options);
        });
        if (d.recommendation) setRecommendation(d.recommendation);
        if (d.decision_options) setDecisionOptions(d.decision_options);
        if (d.ranking) setRanking(d.ranking);
        setToast("✅ Selling plan updated!");
      } else {
        throw new Error("failed");
      }
    } catch {
      const updatedDemo = demoMarkets.map((m) => {
        const rev = (qtyVal / 100) * m.price;
        const tCost = (qtyVal / 100) * m.distance * transportVal;
        const sCost = qtyVal * storageDaysVal * storageRateVal;
        const net = Math.round(rev - tCost - sCost);
        return { ...m, net_realization: net, transport_cost: Math.round(tCost), storage_cost: Math.round(sCost) };
      });
      setMarkets(updatedDemo);
      setDataError("Live recommendations unavailable. Showing sample data.");
    } finally {
      setLoading(false);
    }
  }, [commodity, state, district, marketFilter, commodityGroup, variety, quantity, quality, transportRate, storageDays, storageRate, deliveryPref]);

  /* ── Clean 4-Tab Navigation (My Lots and Transactions removed) ── */
  const TABS = [
    { label: t.nav[0], icon: <IconHome /> },  // About / Home
    { label: t.nav[1], icon: <IconSeed /> },  // Selling Plan
    { label: t.nav[2], icon: <IconChart /> }, // Markets
    { label: t.nav[3], icon: <IconHelp /> },  // Help
  ];

  const sharedProps = {
    t,
    markets,
    recommendation,
    decisionOptions,
    ranking,
    forecast,
    forecastLoading,
    quantity,
    setQuantity,
    quality,
    setQuality,
    state,
    setState,
    district,
    setDistrict,
    commodity,
    setCommodity,
    commodityGroup,
    setCommodityGroup,
    variety,
    setVariety,
    transportRate,
    setTransportRate,
    storageDays,
    setStorageDays,
    storageRate,
    setStorageRate,
    deliveryPref,
    setDeliveryPref,
    runRecommendation,
    loading,
    isRecommendationPending,
    availableStates,
    availableDistricts,
    dataError,
    lang,
  };

  return (
    <div className="app-shell">
      {/* ── Sidebar (desktop) ── */}
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <img src="/images/logo.jpg" alt="AgriMarket AI logo" className="brand-logo" />
          <div>
            <strong>{t.appName}</strong>
            <span>{t.tagline}</span>
          </div>
        </div>

        <div className="lang-switch">
          {["en", "hi"].map((l) => (
            <button
              key={l}
              className={`lang-btn ${lang === l ? "active" : ""}`}
              onClick={() => setLang(l)}
            >
              {l === "en" ? "EN" : "हि"}
            </button>
          ))}
        </div>

        <nav className="sidebar-nav">
          {TABS.map((tab, i) => (
            <button
              key={i}
              className={`nav-item ${active === i ? "nav-active" : ""}`}
              onClick={() => {
                setActive(i);
                setMobileNav(false);
              }}
            >
              {tab.icon} <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <span className="trust-note">🔒 Free · No login required</span>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-wrap">
        {/* Mobile topbar */}
        <header className="topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileNav((s) => !s)} aria-label="Menu">
            <IconMenu />
          </button>
          <span className="topbar-title">{t.appName}</span>
          <div className="topbar-right">
            {["en", "hi"].map((l) => (
              <button
                key={l}
                className={`lang-btn-sm ${lang === l ? "active" : ""}`}
                onClick={() => setLang(l)}
              >
                {l === "en" ? "EN" : "हि"}
              </button>
            ))}
          </div>
        </header>

        {/* Mobile nav backdrop */}
        {mobileNav && <div className="nav-backdrop" onClick={() => setMobileNav(false)} />}

        {/* Bottom tab bar (mobile) */}
        <nav className="bottom-nav">
          {TABS.map((tab, i) => (
            <button
              key={i}
              className={`bottom-nav-btn ${active === i ? "active" : ""}`}
              onClick={() => setActive(i)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Tab content routing */}
        <main className="main-content">
          {active === 0 && (
            <AboutTab
              t={t}
              onGoToPlan={() => setActive(1)}
              onGoToMarkets={() => setActive(2)}
            />
          )}
          {active === 1 && <SellingPlanTab {...sharedProps} />}
          {active === 2 && <MarketsTab {...sharedProps} />}
          {active === 3 && <HelpTab t={t} apiBase={API_BASE_URL} />}
        </main>
      </div>

      <Toast msg={toast} onDone={() => setToast("")} />
    </div>
  );
}
