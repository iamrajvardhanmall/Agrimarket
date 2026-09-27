import { useEffect, useMemo, useState } from "react";
import { graphEdges, graphNodes } from "./graphData";

const Glyph = ({ children, ...props }) => <span aria-hidden="true" {...props}>{children}</span>;
const ArrowUpRight = (props) => <Glyph {...props}>↗</Glyph>;
const BarChart3 = (props) => <Glyph {...props}>▥</Glyph>;
const Bell = (props) => <Glyph {...props}>♢</Glyph>;
const Check = (props) => <Glyph {...props}>✓</Glyph>;
const ChevronRight = (props) => <Glyph {...props}>›</Glyph>;
const CircleHelp = (props) => <Glyph {...props}>?</Glyph>;
const ClipboardList = (props) => <Glyph {...props}>☷</Glyph>;
const CloudSun = (props) => <Glyph {...props}>☼</Glyph>;
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

const graphLayout = {
  "Nashik APMC": { x: 110, y: 110 },
  "Lasalgaon Market": { x: 230, y: 70 },
  "Pimpalgaon Baswant": { x: 330, y: 150 },
  "FreshKart Foods": { x: 70, y: 170 },
  "Sahyadri Processors": { x: 210, y: 185 },
  "GreenBasket Retail": { x: 360, y: 220 },
};

const formatRupees = (value) => `₹${Math.round(value).toLocaleString("en-IN")}`;

function App() {
  const [active, setActive] = useState("Overview");
  const [commodity, setCommodity] = useState("Tomato");
  const [quantity, setQuantity] = useState("5000");
  const [quality, setQuality] = useState("Grade A");
  const [markets, setMarkets] = useState(demoMarkets);
  const [buyers, setBuyers] = useState(fallbackBuyers);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  useEffect(() => {
    const marketTable = document.querySelector(".market-table");
    if (!marketTable) return undefined;
    const chart = document.createElement("div");
    chart.className = "price-chart";
    marketTable.before(chart);
    let plotly;
    import("plotly.js-basic-dist-min").then(({ default: Plotly }) => {
      plotly = Plotly;
      return Plotly.newPlot(chart, [{
        x: ["12 Sep", "13 Sep", "14 Sep", "15 Sep", "16 Sep", "17 Sep", "18 Sep"],
        y: [2640, 2690, 2715, 2780, 2810, 2870, 2920],
        type: "scatter",
        mode: "lines+markers",
        line: { color: "#186b50", width: 3, shape: "spline" },
        marker: { color: "#186b50", size: 5 },
        fill: "tozeroy",
        fillcolor: "rgba(220, 235, 216, 0.7)",
        hovertemplate: "₹%{y:,}<extra></extra>",
      }], {
        height: 180,
        margin: { t: 8, r: 8, b: 30, l: 54 },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        showlegend: false,
        xaxis: { fixedrange: true, showgrid: false, zeroline: false, tickfont: { size: 9, color: "#8b948d" } },
        yaxis: { fixedrange: true, showgrid: true, gridcolor: "#ece9e0", zeroline: false, tickprefix: "₹", tickfont: { size: 9, color: "#8b948d" } },
      }, { displayModeBar: false, responsive: true });
    });
    return () => { if (plotly) plotly.purge(chart); chart.remove(); };
  }, []);

  useEffect(() => {
    Promise.all([fetch(`${API_BASE_URL}/markets/`).then((response) => response.ok ? response.json() : null), fetch(`${API_BASE_URL}/buyers/`).then((response) => response.ok ? response.json() : null)])
      .then(([marketData, buyerData]) => {
        if (marketData?.markets?.length) setMarkets(marketData.markets);
        if (buyerData?.buyers?.length) setBuyers(buyerData.buyers);
      }).catch(() => {});
  }, []);

  const bestMarket = markets.reduce((best, market) => market.net_realization > best.net_realization ? market : best, markets[0]);
  const marketGraph = useMemo(() => {
    const nodeMap = new Map(graphNodes.map((node) => [node.id, node]));
    const adj = new Map();
    for (const node of graphNodes) adj.set(node.id, []);
    for (const edge of graphEdges) {
      adj.get(edge.source)?.push({ ...edge, targetNode: nodeMap.get(edge.target) });
      adj.get(edge.target)?.push({ ...edge, targetNode: nodeMap.get(edge.source) });
    }
    return { nodes: graphNodes, edges: graphEdges, adj };
  }, []);

  const runRecommendation = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ commodity, quantity_kg: Number(quantity), quality }) });
      if (response.ok) {
        const data = await response.json();
        setMarkets(data.options);
      }
    } catch (_) {
      setMarkets(demoMarkets.map((market) => ({ ...market, net_realization: Math.round(market.net_realization * (Number(quantity) / 5000)) })));
    } finally {
      setLoading(false);
      setToast("Recommendation updated");
      window.setTimeout(() => setToast(""), 2400);
    }
  };

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Leaf size={20} /></div><div><strong>agrimarket</strong><span>intelligence platform</span></div></div>
      <div className="profile"><div className="avatar">RK</div><div><strong>Ramesh Kumar</strong><span>Farmer account</span></div><ChevronRight size={16} /></div>
      <nav>{[{ label: "Overview", icon: House }, { label: "Market intelligence", icon: BarChart3 }, { label: "My lots", icon: Package }, { label: "Buyer network", icon: Users }, { label: "Transactions", icon: ClipboardList }].map(({ label, icon: Icon }) => <button className={active === label ? "nav-item active" : "nav-item"} onClick={() => setActive(label)} key={label}><Icon size={18} /><span>{label}</span></button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item"><Settings size={18} /><span>Settings</span></button><button className="nav-item"><CircleHelp size={18} /><span>Help centre</span></button><div className="trust-note"><ShieldCheck size={17} /><span><strong>Verified account</strong><small>Identity checked 12 Aug 2026</small></span></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><button className="mobile-menu"><Menu size={20} /></button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{active}</strong></div><div className="top-actions"><button className="icon-button" title="Search"><Search size={18} /></button><button className="icon-button notification" title="Notifications"><Bell size={18} /><i /></button><div className="mini-avatar">RK</div></div></header>
      <div className="page-wrap">
        <section className="welcome"><div><p className="eyebrow">Friday, 18 September 2026 <span className="live-dot" /> live market data</p><h1>Good morning, Ramesh.</h1><p className="subheading">Your next sale deserves a better decision.</p></div><button className="secondary-button"><CloudSun size={17} /> Nashik · 28°C</button></section>
        <section className="insight-banner"><div className="insight-icon"><Sparkles size={19} /></div><div><span className="eyebrow">Today’s intelligence</span><p>Tomato prices are rising across Nashik markets. Selling between <strong>22–24 September</strong> could improve your return by up to <strong>8.9%</strong>.</p></div><button className="banner-link" onClick={() => document.getElementById("decision-panel")?.scrollIntoView({ behavior: "smooth" })}>See recommendation <ArrowUpRight size={16} /></button></section>
        <section className="stats-grid"><Stat label="Best modal price" value="₹2,920" detail="Lasalgaon Market" trend="+4.2%" positive /><Stat label="Expected net realization" value={formatRupees(bestMarket.net_realization)} detail="For your current lot" trend="+₹12,400" positive /><Stat label="Active buyer matches" value="12" detail="3 high-confidence matches" trend="+3 this week" positive /><Stat label="Open offers" value="03" detail="Awaiting your response" trend="Latest ₹2,975" /></section>
        <div className="content-grid"><section className="primary-column"><section className="panel decision-panel" id="decision-panel"><div className="panel-heading"><div><span className="eyebrow">Decision engine</span><h2>Find your best selling option</h2></div><span className="step-label">01 / 02</span></div><div className="form-grid"><label>What are you selling?<select value={commodity} onChange={(event) => setCommodity(event.target.value)}><option>Tomato</option><option>Onion</option><option>Wheat</option><option>Soybean</option></select></label><label>Available quantity<input type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} /><small>kilograms</small></label><label>Quality grade<select value={quality} onChange={(event) => setQuality(event.target.value)}><option>Grade A</option><option>Grade B</option><option>Mixed quality</option></select></label><button className="primary-button" onClick={runRecommendation}>{loading ? "Calculating..." : <>Calculate recommendation <ArrowUpRight size={17} /></>}</button></div><div className="decision-result"><div className="result-label"><span className="pulse" /> recommended route</div><div className="result-main"><div><h3>{bestMarket.name}</h3><p><MapPin size={14} /> {bestMarket.distance} km from your farm · {bestMarket.demand} demand</p></div><div className="result-value"><span>expected net</span><strong>{formatRupees(bestMarket.net_realization)}</strong></div></div><div className="result-foot"><div><span>Recommended window</span><strong>22–24 Sep</strong></div><div><span>Confidence</span><strong>{bestMarket.confidence}%</strong></div><div><span>Transport estimate</span><strong>{formatRupees(bestMarket.transport_cost)}</strong></div><div className="confidence-bar"><i style={{ width: `${bestMarket.confidence}%` }} /></div></div></div></section>
        <section className="panel"><div className="panel-heading"><div><span className="eyebrow">Compare destinations</span><h2>Market intelligence</h2></div><button className="text-button">View detailed analysis <ArrowUpRight size={15} /></button></div><div className="market-table"><div className="table-row table-head"><span>Market</span><span>Modal price</span><span>7-day trend</span><span>Net realization</span><span /></div>{markets.map((market, index) => <div className="table-row" key={market.id || market.name}><div className="market-name"><span className={`rank rank-${index + 1}`}>{index + 1}</span><span><strong>{market.name}</strong><small>{market.distance} km · {market.demand} demand</small></span></div><strong>{formatRupees(market.price)}<small>/quintal</small></strong><span className="trend-up">↑ {market.trend}%</span><strong>{formatRupees(market.net_realization)}</strong><button className="row-action" title="View market"><ArrowUpRight size={16} /></button></div>)}</div></section>
        <section className="panel graph-panel">
          <div className="panel-heading"><div><span className="eyebrow">Network intelligence</span><h2>Buyer-market graph</h2></div><span className="count-badge">{marketGraph.nodes.length} nodes</span></div>
          <div className="network-visualization">
            <svg className="network-svg" viewBox="0 0 420 260" role="img" aria-label="Market buyer graph">
              {graphEdges.map((edge) => {
                const from = graphLayout[edge.source];
                const to = graphLayout[edge.target];
                return <line key={`${edge.source}-${edge.target}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="graph-edge" strokeWidth={1 + (edge.weight / 100)} />;
              })}
              {graphNodes.map((node) => {
                const isMarket = node.type === "market";
                const position = graphLayout[node.id];
                return <g key={node.id} className={isMarket ? "market-node-group" : "buyer-node-group"}>
                  <circle cx={position.x} cy={position.y} r={isMarket ? 28 : 24} className={isMarket ? "market-node-visual" : "buyer-node-visual"} />
                  <text x={position.x} y={position.y + 4} textAnchor="middle" className="graph-label">{node.label}</text>
                </g>;
              })}
            </svg>
          </div>
          <div className="graph-legend">
            <span><i className="legend-dot market" /> Markets</span>
            <span><i className="legend-dot buyer" /> Buyers</span>
            <span><i className="legend-dot edge" /> Match links</span>
          </div>
        </section>
        </section>
        <aside className="right-column"><section className="panel buyer-panel"><div className="panel-heading"><div><span className="eyebrow">Buyer network</span><h2>Best matches</h2></div><button className="round-plus" title="Create a lot"><Plus size={18} /></button></div>{buyers.map((buyer) => <div className="buyer-row" key={buyer.name}><div className="buyer-logo">{buyer.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</div><div className="buyer-info"><strong>{buyer.name} {buyer.verified && <ShieldCheck size={13} />}</strong><span>{buyer.demand} · {buyer.location}</span></div><div className="match-score"><strong>{buyer.match}%</strong><small>match</small></div></div>)}<button className="outline-button">Explore all buyers <ArrowUpRight size={15} /></button></section><section className="panel offers-panel"><div className="panel-heading"><div><span className="eyebrow">Your activity</span><h2>Recent offers</h2></div><span className="count-badge">3 new</span></div><div className="offer-row"><div className="offer-status"><span /><small>Today, 09:42</small></div><div><strong>FreshKart Foods</strong><span>Lot AGRI-10245</span></div><strong className="offer-price">₹2,975<small>/qtl</small></strong></div><div className="offer-row"><div className="offer-status"><span /><small>Yesterday</small></div><div><strong>Sahyadri Processors</strong><span>Lot AGRI-10245</span></div><strong className="offer-price">₹2,920<small>/qtl</small></strong></div><button className="text-button full-width">Manage all offers <ArrowUpRight size={15} /></button></section><section className="tip-card"><Truck size={20} /><div><strong>Save on transport</strong><p>Combine your lot with 2 nearby farmers to reduce the trip cost by an estimated ₹1,800.</p><button>See aggregation options <ArrowUpRight size={14} /></button></div><X size={16} className="dismiss" /></section></aside></div>
      </div>
    </main>{toast && <div className="toast"><Check size={16} /> {toast}</div>}
  </div>;
}

function Stat({ label, value, detail, trend, positive }) { return <div className="stat-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small><em className={positive ? "positive" : "neutral"}>{positive && "↑ "}{trend}</em></div>; }

export default App;
