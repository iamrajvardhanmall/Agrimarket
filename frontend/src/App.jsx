import { memo, useCallback, useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";

const Glyph = ({ children, ...props }) => <span aria-hidden="true" {...props}>{children}</span>;
const ArrowUpRight = (props) => <Glyph {...props}>↗</Glyph>;
const BarChart3 = (props) => <Glyph {...props}>▥</Glyph>;
const Bell = (props) => <Glyph {...props}>♢</Glyph>;
const Check = (props) => <Glyph {...props}>✓</Glyph>;
const ChevronRight = (props) => <Glyph {...props}>›</Glyph>;
const CircleHelp = (props) => <Glyph {...props}>?</Glyph>;
const ClipboardList = (props) => <Glyph {...props}>☷</Glyph>;
const House = (props) => <Glyph {...props}>⌂</Glyph>;
const Leaf = (props) => <Glyph {...props}>⌁</Glyph>;
const MapPin = (props) => <Glyph {...props}>⌖</Glyph>;
const Menu = (props) => <Glyph {...props}>☰</Glyph>;
const Package = (props) => <Glyph {...props}>□</Glyph>;
const Plus = (props) => <Glyph {...props}>+</Glyph>;
const Search = (props) => <Glyph {...props}>⌕</Glyph>;
const Settings = (props) => <Glyph {...props}>⚙</Glyph>;
const ShieldCheck = (props) => <Glyph {...props}>◇</Glyph>;
const Sparkles = (props) => <Glyph {...props}>✦</Glyph>;
const Truck = (props) => <Glyph {...props}>▰</Glyph>;
const Users = (props) => <Glyph {...props}>♙</Glyph>;
const X = (props) => <Glyph {...props}>×</Glyph>;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const demoMarkets = [
  { id: "nashik", name: "Nashik APMC", district: "Nashik", price: 2850, trend: 6.8, arrival: 4210, distance: 18, demand: "High", confidence: 82, transport_cost: 3420, storage_cost: 0, net_realization: 138300 },
  { id: "lasalgaon", name: "Lasalgaon Market", district: "Nashik", price: 2920, trend: 4.2, arrival: 3650, distance: 34, demand: "High", confidence: 78, transport_cost: 6460, storage_cost: 0, net_realization: 139540 },
  { id: "pimpalgaon", name: "Pimpalgaon Baswant", district: "Nashik", price: 2760, trend: 8.9, arrival: 2980, distance: 42, demand: "Medium", confidence: 74, transport_cost: 7980, storage_cost: 0, net_realization: 130020 },
];

const fallbackBuyers = [
  { name: "FreshKart Foods", match: 94, verified: true, demand: "8-12 tonnes", location: "Pune" },
  { name: "Sahyadri Processors", match: 87, verified: true, demand: "5-8 tonnes", location: "Nashik" },
  { name: "GreenBasket Retail", match: 79, verified: false, demand: "3-5 tonnes", location: "Mumbai" },
];
const commodityGroups = ["Cereals", "Fibre Crops", "Oil Seeds", "Pulses", "Other"];
const commodities = ["Tomato", "Onion", "Wheat", "Soybean", "Bajra(Pearl Millet/Cumbu)", "Paddy(Common)"];
const varieties = ["FAQ", "Local", "Grade A", "Red", "Other"];
const states = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Keralam", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const formatRupees = (value) => `₹${Math.round(value).toLocaleString("en-IN")}`;
const displayDate = new Intl.DateTimeFormat("en-IN", { dateStyle: "full" }).format(new Date());
const greeting = new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false }).format(new Date()) < 12 ? "Good morning" : "Welcome";
const localRecommendationWindow = () => {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 3);
  const format = (date) => new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  const isoDate = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  return { today: isoDate(start), window: `${format(start)} - ${format(end)}` };
};

function useJsonResource(url, initialValue) {
  const [state, setState] = useState({ data: initialValue, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, loading: true, error: null }));
    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        return response.json();
      })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (error.name !== "AbortError") setState((current) => ({ ...current, loading: false, error }));
      });
    return () => controller.abort();
  }, [url]);

  return state;
}

function App() {
  const [active, setActive] = useState("Overview");
  const [commodity, setCommodity] = useState("");
  const [quantity, setQuantity] = useState("5000");
  const [quality, setQuality] = useState("Grade A");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [marketFilter, setMarketFilter] = useState("");
  const [commodityGroup, setCommodityGroup] = useState("");
  const [variety, setVariety] = useState("");
  const [transportRate, setTransportRate] = useState("38");
  const [storageDays, setStorageDays] = useState("0");
  const [storageRate, setStorageRate] = useState("4.5");
  const [markets, setMarkets] = useState(demoMarkets);
  const [buyers, setBuyers] = useState(fallbackBuyers);
  const [analytics, setAnalytics] = useState({ lots: 0, open_lots: 0, offers: 0, pending_offers: 0, grievances: 0 });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [dataError, setDataError] = useState("");
  const [recommendation, setRecommendation] = useState(localRecommendationWindow);
  const [locations, setLocations] = useState({});
  const [mlInsights, setMlInsights] = useState(null);
  const [mlLoading, setMlLoading] = useState(true);
  const [isRecommendationPending, startRecommendationTransition] = useTransition();
  const deferredState = useDeferredValue(state);
  const deferredDistrict = useDeferredValue(district);
  const deferredMarketFilter = useDeferredValue(marketFilter);
  const deferredCommodityGroup = useDeferredValue(commodityGroup);
  const deferredCommodity = useDeferredValue(commodity);
  const deferredVariety = useDeferredValue(variety);
  const availableStates = useMemo(() => Object.keys(locations).length ? Object.keys(locations) : states, [locations]);
  const availableDistricts = useMemo(() => deferredState && locations[deferredState] ? locations[deferredState] : [], [deferredState, locations]);
  const marketParams = useCallback(() => {
    const params = new URLSearchParams();
    [["state", deferredState], ["district", deferredDistrict], ["market", deferredMarketFilter], ["commodity_group", deferredCommodityGroup], ["commodity", deferredCommodity], ["variety", deferredVariety]]
      .forEach(([key, value]) => { if (value) params.set(key, value); });
    return params.toString();
  }, [deferredState, deferredDistrict, deferredMarketFilter, deferredCommodityGroup, deferredCommodity, deferredVariety]);

  const locationsResource = useJsonResource(`${API_BASE_URL}/locations/`, { locations: {} });
  const mlResource = useJsonResource(`${API_BASE_URL}/ml/insights/`, null);
  const mlLoadingState = mlResource.loading;

  useEffect(() => {
    if (locationsResource.data?.locations) setLocations(locationsResource.data.locations);
  }, [locationsResource.data]);

  useEffect(() => {
    setDataError("");
    const controller = new AbortController();
    Promise.all([fetch(`${API_BASE_URL}/markets/?${marketParams()}`, { signal: controller.signal }).then((response) => response.ok ? response.json() : null), fetch(`${API_BASE_URL}/buyers/`, { signal: controller.signal }).then((response) => response.ok ? response.json() : null), fetch(`${API_BASE_URL}/analytics/`, { signal: controller.signal }).then((response) => response.ok ? response.json() : null)])
      .then(([marketData, buyerData, analyticsData]) => {
        if (marketData?.markets?.length) setMarkets(marketData.markets);
        if (buyerData?.buyers?.length) setBuyers(buyerData.buyers);
        if (analyticsData) setAnalytics(analyticsData);
        if (!marketData?.markets?.length) setDataError("No markets match these filters. Try clearing one or more filters.");
      }).catch((error) => { if (error.name !== "AbortError") setDataError("Market data is temporarily unavailable. Showing the latest available sample."); });
    return () => controller.abort();
  }, [marketParams]);

  useEffect(() => {
    if (deferredDistrict && availableDistricts.length && !availableDistricts.includes(deferredDistrict)) {
      setDistrict("");
    }
  }, [deferredDistrict, availableDistricts]);

  useEffect(() => {
    setMlInsights(mlResource.data);
    setMlLoading(mlLoadingState);
  }, [mlLoadingState, mlResource.data]);

  const bestMarket = markets.length ? markets.reduce((best, market) => (market.net_realization || 0) > (best.net_realization || 0) ? market : best, markets[0]) : demoMarkets[0];
  const runRecommendation = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ commodity, state, district, market: marketFilter, commodity_group: commodityGroup, variety, quantity_kg: Number(quantity), quality, transport_rate: Number(transportRate), storage_days: Number(storageDays), storage_rate: Number(storageRate) }) });
      if (response.ok) {
        const data = await response.json();
        startRecommendationTransition(() => setMarkets(data.options));
        if (data.recommendation) setRecommendation(data.recommendation);
      } else {
        throw new Error("Recommendation request failed");
      }
    } catch (_) {
      setMarkets(demoMarkets.map((market) => ({ ...market, net_realization: Math.round((market.price * Number(quantity) / 100) - (market.distance * Number(transportRate) * Number(quantity) / 100) - (Number(storageDays) * Number(storageRate) * Number(quantity))) })));
      setRecommendation(localRecommendationWindow());
      setDataError("Live recommendations are unavailable. Showing an estimate from sample market data.");
    } finally {
      setLoading(false);
      setToast("Recommendation updated");
      window.setTimeout(() => setToast(""), 2400);
    }
  }, [commodity, state, district, marketFilter, commodityGroup, variety, quantity, quality, transportRate, storageDays, storageRate]);

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Leaf size={20} /></div><div><strong>agrimarket</strong><span>intelligence platform</span></div></div>
      <div className="profile"><div className="avatar">FM</div><div><strong>Farmer workspace</strong><span>Public decision support</span></div><ChevronRight size={16} /></div>
      <nav>{[{ label: "Overview", icon: House }, { label: "Market intelligence", icon: BarChart3 }, { label: "My lots", icon: Package }, { label: "Buyer network", icon: Users }, { label: "Transactions", icon: ClipboardList }].map(({ label, icon: Icon }) => <button className={active === label ? "nav-item active" : "nav-item"} onClick={() => setActive(label)} key={label}><Icon size={18} /><span>{label}</span></button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item"><Settings size={18} /><span>Preferences</span></button><button className="nav-item"><CircleHelp size={18} /><span>Help centre</span></button><div className="trust-note"><ShieldCheck size={17} /><span><strong>Open access</strong><small>No account required</small></span></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><button className="mobile-menu" aria-label="Open navigation"><Menu size={20} /></button><div className="breadcrumbs"><span>Public workspace</span><ChevronRight size={14} /><strong>{active}</strong></div><div className="top-actions"><button className="icon-button" title="Search" aria-label="Search"><Search size={18} /></button><button className="icon-button notification" title="Notifications" aria-label="Notifications"><Bell size={18} /><i /></button><div className="mini-avatar">FM</div></div></header>
      <div className="page-wrap">
        <section className="welcome"><div><p className="eyebrow">{displayDate} <span className="live-dot" /> live market data</p><h1>{greeting}, farmer.</h1><p className="subheading">Compare markets and make your next sale with confidence.</p></div><button className="secondary-button"><MapPin size={17} /> Choose your market area</button></section>
        <section className="insight-banner"><div className="insight-icon"><Sparkles size={19} /></div><div><span className="eyebrow">Today’s intelligence</span><p>Use the filters below to compare current prices, transport costs, and estimated net realization for your crop.</p></div><button className="banner-link" onClick={() => document.getElementById("decision-panel")?.scrollIntoView({ behavior: "smooth" })}>Start comparing <ArrowUpRight size={16} /></button></section>
        <section className="stats-grid"><Stat label="Best modal price" value="₹2,920" detail="Lasalgaon Market" trend="+4.2%" positive /><Stat label="Expected net realization" value={formatRupees(bestMarket.net_realization || 0)} detail="For your current lot" trend="+₹12,400" positive /><Stat label="Open lots" value={String(analytics.open_lots)} detail={`${analytics.lots} total lots`} trend="Public workspace" /><Stat label="Pending offers" value={String(analytics.pending_offers)} detail={`${analytics.offers} total offers`} trend={`${analytics.grievances} open grievances`} /></section>
        <div className="content-grid"><section className="primary-column"><section className="panel decision-panel" id="decision-panel"><div className="panel-heading"><div><span className="eyebrow">Decision engine</span><h2>Filter markets and maximize profit</h2></div><span className="step-label">01 / 02</span></div>{dataError && <div className="data-notice" role="status">{dataError}</div>}<div className="filter-grid">        <label>State<select value={state} onChange={(event) => { setState(event.target.value); setDistrict(""); }}><option value="">All states</option>{availableStates.map((item) => <option key={item}>{item}</option>)}</select></label><label>District<select value={district} onChange={(event) => setDistrict(event.target.value)} disabled={!state}><option value="">{state ? "All districts" : "Select a state first"}</option>{availableDistricts.map((item) => <option key={item}>{item}</option>)}</select></label><label>Market<select value={marketFilter} onChange={(event) => setMarketFilter(event.target.value)}><option value="">All Markets</option>{[...new Set(markets.map((item) => item.name))].map((item) => <option key={item}>{item}</option>)}</select></label><label>Commodity group<select value={commodityGroup} onChange={(event) => { setCommodityGroup(event.target.value); setCommodity(""); }}><option value="">All Commodity Groups</option>{commodityGroups.map((item) => <option key={item}>{item}</option>)}</select></label><label>Commodity<select value={commodity} onChange={(event) => { setCommodity(event.target.value); setCommodityGroup(""); }}><option value="">All Commodities</option>{commodities.map((item) => <option key={item}>{item}</option>)}</select></label><label>Variety<select value={variety} onChange={(event) => setVariety(event.target.value)}><option value="">All Varieties</option>{varieties.map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="form-grid">        <label>Available quantity<input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /><small>kilograms</small></label><label>Quality grade<select value={quality} onChange={(event) => setQuality(event.target.value)}><option>Grade A</option><option>Grade B</option><option>Mixed quality</option></select></label><label>Transport rate<input type="number" min="0" value={transportRate} onChange={(event) => setTransportRate(event.target.value)} /><small>₹/qtl/km</small></label><label>Storage days<input type="number" min="0" value={storageDays} onChange={(event) => setStorageDays(event.target.value)} /></label><label>Storage rate<input type="number" min="0" value={storageRate} onChange={(event) => setStorageRate(event.target.value)} /><small>₹/kg/day</small></label>        <button className="primary-button" onClick={runRecommendation} disabled={loading || isRecommendationPending}>{loading || isRecommendationPending ? "Calculating..." : <>Maximize expected profit <ArrowUpRight size={17} /></>}</button></div><div className="decision-result"><div className="result-label"><span className="pulse" /> recommended route</div><div className="result-main"><div><h3>{bestMarket.name}</h3><p><MapPin size={14} /> {bestMarket.distance} km from your farm · {bestMarket.demand} demand</p></div><div className="result-value"><span>expected net</span><strong>{formatRupees(bestMarket.net_realization)}</strong></div></div>        <div className="result-foot"><div><span>Today</span><strong>{recommendation.today}</strong></div><div><span>Recommended window</span><strong>{recommendation.window}</strong></div><div><span>Confidence</span><strong>{bestMarket.confidence}%</strong></div><div><span>Transport estimate</span><strong>{formatRupees(bestMarket.transport_cost)}</strong></div><div className="confidence-bar"><i style={{ width: `${bestMarket.confidence}%` }} /></div></div></div></section>
        <section className="panel"><div className="panel-heading"><div><span className="eyebrow">Compare destinations</span><h2>Market intelligence</h2></div><button className="text-button">View detailed analysis <ArrowUpRight size={15} /></button></div><div className="market-table"><div className="table-row table-head"><span>Market</span><span>Modal price</span><span>7-day trend</span><span>Net realization</span><span /></div>{markets.map((market, index) => <div className="table-row" key={market.id || market.name}><div className="market-name"><span className={`rank rank-${index + 1}`}>{index + 1}</span><span><strong>{market.name}</strong><small>{market.distance} km · {market.demand} demand</small></span></div><strong>{formatRupees(market.price)}<small>/quintal</small></strong><span className="trend-up">↑ {market.trend}%</span><strong>{formatRupees(market.net_realization)}</strong><button className="row-action" title="View market"><ArrowUpRight size={16} /></button></div>)}</div></section>
        <section className="panel"><div className="panel-heading"><div><span className="eyebrow">Operations</span><h2>Public marketplace activity</h2></div><span className="count-badge">No login required</span></div><div className="market-table"><div className="table-row"><span>Open farmer lots</span><strong>{analytics.open_lots}</strong><small>Available for matching</small></div><div className="table-row"><span>Offers awaiting response</span><strong>{analytics.pending_offers}</strong><small>Negotiation queue</small></div><div className="table-row"><span>Open grievances</span><strong>{analytics.grievances}</strong><small>Requires resolution</small></div></div></section>
        </section>
        </div>
        <aside className="right-column"><section className="panel buyer-panel"><div className="panel-heading"><div><span className="eyebrow">Buyer network</span><h2>Best matches</h2></div><button className="round-plus" title="Create a lot"><Plus size={18} /></button></div>{buyers.map((buyer) => <div className="buyer-row" key={buyer.name}><div className="buyer-logo">{buyer.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</div><div className="buyer-info"><strong>{buyer.name} {buyer.verified && <ShieldCheck size={13} />}</strong><span>{buyer.demand} · {buyer.location}</span></div><div className="match-score"><strong>{buyer.match}%</strong><small>match</small></div></div>)}<button className="outline-button">Explore all buyers <ArrowUpRight size={15} /></button>        </section><section className="panel ml-panel"><div className="panel-heading"><div><span className="eyebrow">Machine learning</span><h2>Market intelligence</h2></div><span className="count-badge">Live model</span></div>{mlLoading ? <p className="ml-status">Training models on the latest mandi dataset...</p> : mlInsights ? <><div className="ml-highlight"><strong>{(mlInsights.classification.accuracy * 100).toFixed(1)}%</strong><span>opportunity classification accuracy</span></div><div className="ml-metrics"><div><span>Best model</span><strong>Decision tree</strong><small>MAE ₹{mlInsights.regression.decision_tree_regression.mae}</small></div><div><span>Price fit</span><strong>R² {mlInsights.regression.linear_regression.r2}</strong><small>RMSE ₹{mlInsights.regression.linear_regression.rmse}</small></div><div><span>Segments</span><strong>{mlInsights.clustering.clusters}</strong><small>K-means groups</small></div></div><small className="ml-footnote">Based on {mlInsights.trained_on.toLocaleString("en-IN")} market records. Use as decision support, not a guaranteed price.</small></> : <p className="ml-status">ML insights are temporarily unavailable.</p>}</section><section className="panel offers-panel"><div className="panel-heading"><div><span className="eyebrow">Your activity</span><h2>Recent offers</h2></div><span className="count-badge">3 new</span></div><div className="offer-row"><div className="offer-status"><span /><small>Today, 09:42</small></div><div><strong>FreshKart Foods</strong><span>Lot AGRI-10245</span></div><strong className="offer-price">₹2,975<small>/qtl</small></strong></div><div className="offer-row"><div className="offer-status"><span /><small>Yesterday</small></div><div><strong>Sahyadri Processors</strong><span>Lot AGRI-10245</span></div><strong className="offer-price">₹2,920<small>/qtl</small></strong></div><button className="text-button full-width">Manage all offers <ArrowUpRight size={15} /></button></section><section className="tip-card"><Truck size={20} /><div><strong>Save on transport</strong><p>Combine your lot with 2 nearby farmers to reduce the trip cost by an estimated ₹1,800.</p><button>See aggregation options <ArrowUpRight size={14} /></button></div><X size={16} className="dismiss" /></section></aside></div>
    </main>{toast && <div className="toast"><Check size={16} /> {toast}</div>}
  </div>;
}

const Stat = memo(function Stat({ label, value, detail, trend, positive }) {
  return <div className="stat-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small><em className={positive ? "positive" : "neutral"}>{positive && "↑ "}{trend}</em></div>;
});

export default App;
