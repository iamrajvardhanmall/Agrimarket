import { memo, useCallback, useDeferredValue, useEffect, useMemo, useReducer, useRef, useState, useTransition } from "react";

/* ─── Icon glyphs (no external deps) ─── */
const Glyph = ({ children, className = "", style }) => <span aria-hidden="true" className={className} style={style}>{children}</span>;
const IconHome      = (p) => <Glyph {...p}>🏠</Glyph>;
const IconChart     = (p) => <Glyph {...p}>📊</Glyph>;
const IconLot       = (p) => <Glyph {...p}>📦</Glyph>;
const IconReceipt   = (p) => <Glyph {...p}>🧾</Glyph>;
const IconHelp      = (p) => <Glyph {...p}>❓</Glyph>;
const IconLeaf      = (p) => <Glyph {...p}>🌿</Glyph>;
const IconPin       = (p) => <Glyph {...p}>📍</Glyph>;
const IconTruck     = (p) => <Glyph {...p}>🚛</Glyph>;
const IconRupee     = (p) => <Glyph {...p}>💰</Glyph>;
const IconUp        = (p) => <Glyph {...p}>↑</Glyph>;
const IconDown      = (p) => <Glyph {...p}>↓</Glyph>;
const IconCheck     = (p) => <Glyph {...p}>✅</Glyph>;
const IconWarn      = (p) => <Glyph {...p}>⚠️</Glyph>;
const IconStar      = (p) => <Glyph {...p}>⭐</Glyph>;
const IconWhatsApp  = (p) => <Glyph {...p}>💬</Glyph>;
const IconClose     = (p) => <Glyph {...p}>✕</Glyph>;
const IconMenu      = (p) => <Glyph {...p}>☰</Glyph>;
const IconCalendar  = (p) => <Glyph {...p}>📅</Glyph>;
const IconSeed      = (p) => <Glyph {...p}>🌾</Glyph>;
const IconArrow     = (p) => <Glyph {...p}>→</Glyph>;

/* ─── Constants ─── */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const LANGS = {
  en: {
    appName: "AgriMarket",
    tagline: "Sell smarter. Earn more.",
    greeting_morning: "Good morning",
    greeting_day: "Welcome",
    nav: ["Home", "Markets", "My Lots", "Transactions", "Help"],
    todayAdvice: "Today's selling advice",
    bestMarket: "Best market today",
    moneyYouGet: "Money you'll receive",
    afterCosts: "after transport & storage costs",
    sellNow: "Sell NOW",
    storeLater: "Store & sell later",
    altMarket: "Try another market",
    runAdvice: "Get my selling plan",
    running: "Calculating…",
    confidence: "AI Confidence",
    qty: "How much do you have? (kg)",
    quality: "Quality of your crop",
    state: "Your state",
    district: "Your district",
    commodity: "Your crop",
    transport: "Transport cost (₹/qtl/km)",
    storageDays: "Storage days",
    storageRate: "Storage cost (₹/kg/day)",
    compare: "Compare markets",
    marketName: "Market",
    modalPrice: "Price (₹/qtl)",
    profit: "You'll earn",
    distance: "Distance",
    demand: "Demand",
    trend7: "7-day trend",
    myLots: "My lots",
    newLot: "+ List a new lot",
    lotId: "Lot ID",
    lotCrop: "Crop",
    lotQty: "Quantity",
    lotPrice: "Asking price",
    lotStatus: "Status",
    offers: "Offers on your lots",
    accept: "Accept",
    reject: "Reject",
    transactions: "Transaction history",
    grievance: "File a complaint",
    grievanceDesc: "Describe your issue",
    submit: "Submit",
    tips: "Tips to earn more",
    whatsapp: "Share on WhatsApp",
    noMarkets: "No markets found. Try changing your crop or district.",
    forecast: "Price forecast (next 7 days)",
    open: "OPEN",
    sold: "SOLD",
    pending: "PENDING",
    filter: "Filter",
    variety: "Variety",
    allStates: "All states",
    allDistricts: "All districts",
    allCrops: "All crops",
    allVarieties: "All varieties",
    allMarkets: "All markets",
    noOffersYet: "No offers yet on your lots.",
    noLotsYet: "You have no active lots. List one above!",
    noTransactions: "No transactions yet.",
    farmerTips: [
      { icon: "🕐", title: "Sell early in the week", body: "Monday–Wednesday arrivals are lower, so prices tend to be slightly higher." },
      { icon: "🌦️", title: "Watch the weather", body: "Post-rain harvests flood the market. Hold 3–5 days if rain is forecast." },
      { icon: "🏷️", title: "Sort your produce", body: "Grade A lots fetch 10–20% more per quintal than mixed-quality lots." },
      { icon: "🤝", title: "Negotiate transport", body: "Group with neighbours to share a truck and halve your transport cost." },
      { icon: "📱", title: "Check daily prices", body: "Open this app every morning before deciding when to send your produce." },
    ],
    deliveryPref: "Delivery preference",
    anyDelivery: "Any",
    farmerDelivers: "I deliver",
    scheduledPickup: "Scheduled pickup",
    gradeA: "Grade A",
    gradeB: "Grade B",
    mixed: "Mixed quality",
    faq: "Frequently asked questions",
    faqs: [
      { q: "Is this app free?", a: "Yes — completely free, no login required." },
      { q: "How are prices calculated?", a: "Prices come from government mandi data (data.gov.in). AI predicts the best time to sell." },
      { q: "What is 'money you'll receive'?", a: "It is your expected income after subtracting transport and storage costs from the market price." },
      { q: "Can I sell directly through this app?", a: "Not yet. Use this app to choose the best market, then go there and sell. We show you offers from buyers too." },
      { q: "How do I file a complaint?", a: "Go to the Help tab and fill in the complaint form below." },
    ],
    grievanceSuccess: "Complaint submitted. We will contact you within 2 working days.",
    lotCreated: "Lot listed successfully!",
  },
  hi: {
    appName: "एग्रीमार्केट",
    tagline: "स्मार्ट बेचें। ज़्यादा कमाएं।",
    greeting_morning: "सुप्रभात",
    greeting_day: "नमस्ते",
    nav: ["होम", "बाज़ार", "मेरे लॉट", "लेन-देन", "सहायता"],
    todayAdvice: "आज की बिक्री सलाह",
    bestMarket: "आज का सबसे अच्छा बाज़ार",
    moneyYouGet: "आपको मिलेगी राशि",
    afterCosts: "परिवहन और भंडारण के बाद",
    sellNow: "अभी बेचें",
    storeLater: "रखें और बाद में बेचें",
    altMarket: "दूसरा बाज़ार चुनें",
    runAdvice: "मेरी बिक्री योजना देखें",
    running: "गणना हो रही है…",
    confidence: "AI विश्वास",
    qty: "आपके पास कितना है? (किग्रा)",
    quality: "फसल की गुणवत्ता",
    state: "आपका राज्य",
    district: "आपका जिला",
    commodity: "आपकी फसल",
    transport: "परिवहन लागत (₹/क्विंटल/किमी)",
    storageDays: "भंडारण दिन",
    storageRate: "भंडारण लागत (₹/किग्रा/दिन)",
    compare: "बाज़ार तुलना करें",
    marketName: "बाज़ार",
    modalPrice: "मूल्य (₹/क्विंटल)",
    profit: "आप कमाएंगे",
    distance: "दूरी",
    demand: "मांग",
    trend7: "7-दिन का रुझान",
    myLots: "मेरे लॉट",
    newLot: "+ नया लॉट दर्ज करें",
    lotId: "लॉट आईडी",
    lotCrop: "फसल",
    lotQty: "मात्रा",
    lotPrice: "मांगा मूल्य",
    lotStatus: "स्थिति",
    offers: "आपके लॉट पर ऑफर",
    accept: "स्वीकार",
    reject: "अस्वीकार",
    transactions: "लेन-देन इतिहास",
    grievance: "शिकायत दर्ज करें",
    grievanceDesc: "अपनी समस्या बताएं",
    submit: "जमा करें",
    tips: "अधिक कमाने के सुझाव",
    whatsapp: "WhatsApp पर शेयर करें",
    noMarkets: "कोई बाज़ार नहीं मिला। अपनी फसल या जिला बदलें।",
    forecast: "मूल्य पूर्वानुमान (अगले 7 दिन)",
    open: "खुला",
    sold: "बेचा",
    pending: "प्रतीक्षित",
    filter: "फ़िल्टर",
    variety: "किस्म",
    allStates: "सभी राज्य",
    allDistricts: "सभी जिले",
    allCrops: "सभी फसलें",
    allVarieties: "सभी किस्में",
    allMarkets: "सभी बाज़ार",
    noOffersYet: "अभी तक कोई ऑफर नहीं।",
    noLotsYet: "आपका कोई सक्रिय लॉट नहीं है।",
    noTransactions: "अभी तक कोई लेन-देन नहीं।",
    farmerTips: [
      { icon: "🕐", title: "सप्ताह की शुरुआत में बेचें", body: "सोमवार–बुधवार कम आवक होती है, इसलिए कीमतें थोड़ी बेहतर होती हैं।" },
      { icon: "🌦️", title: "मौसम पर ध्यान दें", body: "बारिश के बाद बाज़ार में ज़्यादा माल आता है। 3–5 दिन रुकें।" },
      { icon: "🏷️", title: "छँटाई करें", body: "ग्रेड A लॉट 10–20% अधिक कीमत पाते हैं।" },
      { icon: "🤝", title: "परिवहन बाँटें", body: "पड़ोसियों के साथ ट्रक साझा करें और खर्च आधा करें।" },
      { icon: "📱", title: "रोज़ कीमत जांचें", body: "हर सुबह इस ऐप से कीमत देखें।" },
    ],
    deliveryPref: "डिलीवरी पसंद",
    anyDelivery: "कोई भी",
    farmerDelivers: "मैं पहुंचाऊंगा",
    scheduledPickup: "निर्धारित पिकअप",
    gradeA: "ग्रेड A",
    gradeB: "ग्रेड B",
    mixed: "मिश्रित",
    faq: "अक्सर पूछे जाने वाले प्रश्न",
    faqs: [
      { q: "क्या यह ऐप मुफ़्त है?", a: "हाँ — पूरी तरह मुफ़्त, कोई लॉगिन नहीं चाहिए।" },
      { q: "कीमतें कैसे तय होती हैं?", a: "कीमतें सरकारी मंडी डेटा (data.gov.in) से आती हैं। AI सबसे अच्छे समय की सलाह देता है।" },
      { q: "'आपको मिलेगी राशि' क्या है?", a: "परिवहन और भंडारण घटाने के बाद आपकी अपेक्षित आय।" },
      { q: "क्या मैं इस ऐप से सीधे बेच सकता हूँ?", a: "अभी नहीं। बेहतर बाज़ार चुनें और वहाँ जाकर बेचें।" },
      { q: "शिकायत कैसे करें?", a: "सहायता टैब में जाएं और नीचे फॉर्म भरें।" },
    ],
    grievanceSuccess: "शिकायत दर्ज हुई। 2 कार्य दिवसों में संपर्क करेंगे।",
    lotCreated: "लॉट सफलतापूर्वक दर्ज हुआ!",
  },
};

const commodityGroups = ["Cereals", "Fibre Crops", "Oil Seeds", "Pulses", "Other"];
const commodities     = ["Tomato", "Onion", "Wheat", "Soybean", "Bajra(Pearl Millet/Cumbu)", "Paddy(Common)", "Cotton", "Maize", "Groundnut", "Mustard"];
const varieties       = ["FAQ", "Local", "Grade A", "Red", "Other"];
const states = [
  "Andhra Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Odisha", "Punjab", "Rajasthan", "Tamil Nadu",
  "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const demoMarkets = [
  { id: "nashik", name: "Nashik APMC", district: "Nashik", state: "Maharashtra", price: 2850, min_price: 2600, max_price: 3100, trend: 6.8, arrival_quantity: 4210, distance: 18, demand: "High", confidence: 82, transport_cost: 3420, storage_cost: 0, net_realization: 138300 },
  { id: "lasalgaon", name: "Lasalgaon Market", district: "Nashik", state: "Maharashtra", price: 2920, min_price: 2720, max_price: 3050, trend: 4.2, arrival_quantity: 3650, distance: 34, demand: "High", confidence: 78, transport_cost: 6460, storage_cost: 0, net_realization: 139540 },
  { id: "pimpalgaon", name: "Pimpalgaon Baswant", district: "Nashik", state: "Maharashtra", price: 2760, min_price: 2500, max_price: 2950, trend: 8.9, arrival_quantity: 2980, distance: 42, demand: "Medium", confidence: 74, transport_cost: 7980, storage_cost: 0, net_realization: 130020 },
  { id: "pune", name: "Pune APMC", district: "Pune", state: "Maharashtra", price: 2700, min_price: 2400, max_price: 3000, trend: -1.2, arrival_quantity: 6100, distance: 85, demand: "Medium", confidence: 69, transport_cost: 16150, storage_cost: 0, net_realization: 119350 },
];

/* ─── Helpers ─── */
const fmt = (v) => Number.isFinite(Number(v)) ? `₹${Math.round(Number(v)).toLocaleString("en-IN")}` : "—";
const fmtNum = (v, s = "") => (v === undefined || v === null || Number(v) === 0) ? "—" : `${Math.round(Number(v)).toLocaleString("en-IN")}${s}`;
const today = () => new Date().toLocaleDateString("en-IN", { dateStyle: "full" });
const isMorning = () => new Date().getHours() < 12;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const pct = (n) => `${n}%`;

/* ─── Data hook ─── */
function useApi(url, init) {
  const [state, set] = useState({ data: init, loading: true, error: null });
  useEffect(() => {
    const ac = new AbortController();
    set(s => ({ ...s, loading: true, error: null }));
    fetch(url, { signal: ac.signal })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(r.status)))
      .then(data => set({ data, loading: false, error: null }))
      .catch(e => { if (e.name !== "AbortError") set(s => ({ ...s, loading: false, error: e })); });
    return () => ac.abort();
  }, [url]);
  return state;
}

/* ─── Toast ─── */
function Toast({ msg, onDone }) {
  useEffect(() => { if (msg) { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); } }, [msg, onDone]);
  if (!msg) return null;
  return <div className="toast"><IconCheck /> {msg}</div>;
}

/* ─── Stat card ─── */
const StatCard = memo(function StatCard({ label, value, sub, up }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {sub && <small className={`stat-sub ${up === true ? "positive" : up === false ? "negative" : ""}`}>{sub}</small>}
    </div>
  );
});

/* ─── Confidence bar ─── */
function ConfBar({ pct: p }) {
  const color = p >= 75 ? "#186b50" : p >= 50 ? "#e8b95b" : "#c0392b";
  return (
    <div className="conf-bar-wrap">
      <div className="conf-bar-bg">
        <div className="conf-bar-fill" style={{ width: `${clamp(p, 0, 100)}%`, background: color }} />
      </div>
      <span style={{ color }}>{clamp(p, 0, 100)}%</span>
    </div>
  );
}

/* ─── WhatsApp share ─── */
function shareWhatsApp(t, market, net, lang) {
  const msg = lang === "hi"
    ? `🌾 AgriMarket सलाह: ${market} पर अभी बेचें — ₹${Math.round(net).toLocaleString("en-IN")} मिलेंगे!\nagrimarket.app`
    : `🌾 AgriMarket tip: Sell at ${market} now — you'll earn ${fmt(net)}!\nagrimarket.app`;
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
}

/* ═══════════════════════════════════════════════════════════════
   HOME TAB
═══════════════════════════════════════════════════════════════ */
function HomeTab({ t, markets, recommendation, decisionOptions, ranking, forecast, forecastLoading,
                   quantity, setQuantity, quality, setQuality,
                   state, setState, district, setDistrict,
                   commodity, setCommodity, commodityGroup, setCommodityGroup,
                   variety, setVariety, transportRate, setTransportRate,
                   storageDays, setStorageDays, storageRate, setStorageRate,
                   deliveryPref, setDeliveryPref,
                   runRecommendation, loading, isRecommendationPending,
                   availableStates, availableDistricts, dataError, lang }) {
  const best = markets[0] || demoMarkets[0];
  const recommended = decisionOptions.find(o => o.type === recommendation?.type) || decisionOptions[0];
  const net = recommended?.net_realization ?? best?.net_realization ?? 0;
  const conf = recommendation?.confidence ?? best?.confidence ?? 0;
  const label = recommendation?.label || t.sellNow;
  const marketName = recommendation?.market || best?.name || "—";

  return (
    <div className="tab-content">
      {/* ── Hero ── */}
      <div className="hero-card">
        <div className="hero-badge"><IconSeed /> {today()}</div>
        <h1 className="hero-title">{t.todayAdvice}</h1>
        <div className="hero-market">
          <IconPin /> <strong>{marketName}</strong>
          {best?.distance ? <span className="muted"> · {best.distance} km</span> : null}
          {best?.demand   ? <span className={`demand-pill demand-${(best.demand||"").toLowerCase()}`}>{best.demand}</span> : null}
        </div>
        <div className="hero-net">
          <span className="hero-net-label">{t.moneyYouGet}</span>
          <span className="hero-net-value">{fmt(net)}</span>
          <span className="hero-net-sub">{t.afterCosts}</span>
        </div>
        <div className="hero-actions">
          <button className="btn-primary" onClick={runRecommendation} disabled={loading || isRecommendationPending}>
            {loading || isRecommendationPending ? t.running : <>{t.runAdvice} <IconArrow /></>}
          </button>
          <button className="btn-whatsapp" onClick={() => shareWhatsApp(t, marketName, net, lang)}>
            <IconWhatsApp /> {t.whatsapp}
          </button>
        </div>
        {conf > 0 && <div className="hero-conf"><span>{t.confidence}</span><ConfBar pct={conf} /></div>}
      </div>

      {dataError && <div className="notice warn"><IconWarn /> {dataError}</div>}

      {/* ── Scenarios ── */}
      {decisionOptions.length > 0 && (
        <section className="panel">
          <h2 className="panel-title">{t.sellNow} vs {t.storeLater}</h2>
          <div className="scenario-grid">
            {decisionOptions.map(opt => (
              <div key={opt.type} className={`scenario-card ${opt.type === recommendation?.type ? "scenario-best" : ""}`}>
                {opt.type === recommendation?.type && <span className="scenario-badge"><IconStar /> AI picks this</span>}
                <strong>{opt.label}</strong>
                <div className="scenario-market"><IconPin /> {opt.market}</div>
                <div className="scenario-net">{fmt(opt.net_realization)}</div>
                <small>{t.moneyYouGet}</small>
              </div>
            ))}
          </div>
          {recommendation?.reason && <p className="muted reason-text"><IconWarn className="inline" /> {recommendation.reason}</p>}
        </section>
      )}

      {/* ── Wizard form ── */}
      <section className="panel">
        <h2 className="panel-title">{t.filter}</h2>
        <div className="wizard-grid">
          <label className="field">
            <span>{t.commodity}</span>
            <select value={commodity} onChange={e => { setCommodity(e.target.value); setCommodityGroup(""); }}>
              <option value="">{t.allCrops}</option>
              {commodities.map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="field">
            <span>{t.qty}</span>
            <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} />
          </label>
          <label className="field">
            <span>{t.quality}</span>
            <select value={quality} onChange={e => setQuality(e.target.value)}>
              <option>{t.gradeA}</option><option>{t.gradeB}</option><option>{t.mixed}</option>
            </select>
          </label>
          <label className="field">
            <span>{t.state}</span>
            <select value={state} onChange={e => { setState(e.target.value); setDistrict(""); }}>
              <option value="">{t.allStates}</option>
              {availableStates.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="field">
            <span>{t.district}</span>
            <select value={district} onChange={e => setDistrict(e.target.value)} disabled={!state}>
              <option value="">{state ? t.allDistricts : "Select state first"}</option>
              {availableDistricts.map(d => <option key={d}>{d}</option>)}
            </select>
          </label>
          <label className="field">
            <span>{t.variety}</span>
            <select value={variety} onChange={e => setVariety(e.target.value)}>
              <option value="">{t.allVarieties}</option>
              {varieties.map(v => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label className="field">
            <span>{t.transport}</span>
            <input type="number" min="0" step="0.5" value={transportRate} onChange={e => setTransportRate(e.target.value)} />
          </label>
          <label className="field">
            <span>{t.storageDays}</span>
            <input type="number" min="0" value={storageDays} onChange={e => setStorageDays(e.target.value)} />
          </label>
          <label className="field">
            <span>{t.storageRate}</span>
            <input type="number" min="0" step="0.5" value={storageRate} onChange={e => setStorageRate(e.target.value)} />
          </label>
          <label className="field">
            <span>{t.deliveryPref}</span>
            <select value={deliveryPref} onChange={e => setDeliveryPref(e.target.value)}>
              <option value="">{t.anyDelivery}</option>
              <option value="Farmer delivers">{t.farmerDelivers}</option>
              <option value="Scheduled pickup">{t.scheduledPickup}</option>
            </select>
          </label>
        </div>
        <button className="btn-primary full-width" onClick={runRecommendation} disabled={loading || isRecommendationPending}>
          {loading || isRecommendationPending ? t.running : <>{t.runAdvice} <IconArrow /></>}
        </button>
      </section>

      {/* ── Tips ── */}
      <section className="panel">
        <h2 className="panel-title"><IconLeaf /> {t.tips}</h2>
        <div className="tips-grid">
          {t.farmerTips.map((tip, i) => (
            <div className="tip-card" key={i}>
              <span className="tip-icon">{tip.icon}</span>
              <div><strong>{tip.title}</strong><p>{tip.body}</p></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MARKETS TAB
═══════════════════════════════════════════════════════════════ */
function MarketsTab({ t, markets, ranking, forecast, forecastLoading, dataError }) {
  const best = markets[0] || demoMarkets[0];
  return (
    <div className="tab-content">
      <div className="panel-heading-row">
        <h2 className="panel-title">{t.compare}</h2>
        {ranking?.highest_profit_route && (
          <span className="badge-green"><IconStar /> {ranking.highest_profit_route.market}</span>
        )}
      </div>
      {dataError && <div className="notice warn"><IconWarn /> {dataError}</div>}

      {/* Markets table */}
      <section className="panel">
        <div className="market-table-wrap">
          <table className="market-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t.marketName}</th>
                <th>{t.modalPrice}</th>
                <th>Min / Max</th>
                <th>{t.distance}</th>
                <th>{t.demand}</th>
                <th>{t.trend7}</th>
                <th>{t.profit}</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((m, i) => (
                <tr key={m.id || m.name} className={i === 0 ? "best-row" : ""}>
                  <td><span className={`rank-badge rank-${i+1}`}>{m.rank || i+1}</span></td>
                  <td>
                    <strong>{m.name}</strong>
                    {i === 0 && <span className="best-badge">★ Best</span>}
                    <div className="muted small">{m.district}</div>
                  </td>
                  <td><strong>{fmt(m.price)}</strong></td>
                  <td className="muted small">{fmtNum(m.min_price)} / {fmtNum(m.max_price)}</td>
                  <td>{m.distance ? `${m.distance} km` : "—"}</td>
                  <td><span className={`demand-pill demand-${(m.demand||"").toLowerCase()}`}>{m.demand || "—"}</span></td>
                  <td>
                    {m.trend > 0
                      ? <span className="trend-up"><IconUp /> {m.trend}%</span>
                      : <span className="trend-down"><IconDown /> {Math.abs(m.trend)}%</span>}
                  </td>
                  <td><strong className="net-value">{fmt(m.net_realization)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Forecast */}
      <section className="panel">
        <h2 className="panel-title"><IconCalendar /> {t.forecast}</h2>
        {forecastLoading ? (
          <p className="loading-text">Calculating…</p>
        ) : forecast ? (
          <>
            <div className="forecast-row">
              {Array.from({ length: 7 }, (_, i) => i + 1).map(d => (
                <div className="forecast-day" key={d}>
                  <span className="fd-label">Day {d}</span>
                  <strong className="fd-val">{fmt(forecast.forecasts[`${d}_day`])}</strong>
                </div>
              ))}
            </div>
            {forecast.chart && (
              <img className="forecast-img" src={forecast.chart} alt="Price forecast chart" />
            )}
            <p className="muted small">Forecast uses moving-average method. Use as guidance only.</p>
          </>
        ) : (
          <p className="muted">Forecast unavailable.</p>
        )}
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MY LOTS TAB
═══════════════════════════════════════════════════════════════ */
function MyLotsTab({ t, apiBase }) {
  const [lots, setLots] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");

  const [form, setForm] = useReducer((s, p) => ({ ...s, ...p }), {
    commodity: "", quantity_kg: "5000", quality: "Grade A",
    asking_price: "2800", origin: "", available_on: new Date().toISOString().slice(0, 10),
  });

  const loadLots   = useCallback(async () => {
    try { const r = await fetch(`${apiBase}/lots/`);   if (r.ok) { const d = await r.json(); setLots(d.lots || []); } } catch {}
  }, [apiBase]);
  const loadOffers = useCallback(async () => {
    try { const r = await fetch(`${apiBase}/offers/`); if (r.ok) { const d = await r.json(); setOffers(d.offers || []); } } catch {}
  }, [apiBase]);

  useEffect(() => { loadLots(); loadOffers(); }, [loadLots, loadOffers]);

  const submitLot = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${apiBase}/lots/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quantity_kg: Number(form.quantity_kg), asking_price: Number(form.asking_price) }),
      });
      if (r.ok) { setToast(t.lotCreated); setShowForm(false); loadLots(); }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="tab-content">
      <Toast msg={toast} onDone={() => setToast("")} />
      <div className="panel-heading-row">
        <h2 className="panel-title"><IconLot /> {t.myLots}</h2>
        <button className="btn-secondary" onClick={() => setShowForm(s => !s)}>{showForm ? "✕ Cancel" : t.newLot}</button>
      </div>

      {showForm && (
        <section className="panel form-panel">
          <h3>List a new lot</h3>
          <div className="wizard-grid">
            <label className="field"><span>{t.lotCrop}</span>
              <select value={form.commodity} onChange={e => setForm({ commodity: e.target.value })}>
                <option value="">Select crop</option>{commodities.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="field"><span>{t.lotQty} (kg)</span>
              <input type="number" min="1" value={form.quantity_kg} onChange={e => setForm({ quantity_kg: e.target.value })} />
            </label>
            <label className="field"><span>Quality</span>
              <select value={form.quality} onChange={e => setForm({ quality: e.target.value })}>
                <option>Grade A</option><option>Grade B</option><option>Mixed quality</option>
              </select>
            </label>
            <label className="field"><span>{t.lotPrice} (₹/qtl)</span>
              <input type="number" min="1" value={form.asking_price} onChange={e => setForm({ asking_price: e.target.value })} />
            </label>
            <label className="field"><span>Village / Origin</span>
              <input type="text" placeholder="e.g. Nashik" value={form.origin} onChange={e => setForm({ origin: e.target.value })} />
            </label>
            <label className="field"><span>Available from</span>
              <input type="date" value={form.available_on} onChange={e => setForm({ available_on: e.target.value })} />
            </label>
          </div>
          <button className="btn-primary" onClick={submitLot} disabled={loading || !form.commodity}>
            {loading ? "Submitting…" : "List my lot"}
          </button>
        </section>
      )}

      <section className="panel">
        {lots.length === 0
          ? <p className="muted">{t.noLotsYet}</p>
          : (
            <div className="lot-list">
              {lots.map(lot => (
                <div className="lot-card" key={lot.id}>
                  <div className="lot-header">
                    <strong>{lot.commodity || "—"}</strong>
                    <span className={`status-pill status-${(lot.status||"").toLowerCase()}`}>{lot.status}</span>
                  </div>
                  <div className="lot-meta">
                    <span><IconLot /> {fmtNum(lot.quantity_kg)} kg</span>
                    <span><IconRupee /> {fmt(lot.asking_price)}/qtl</span>
                    {lot.origin && <span><IconPin /> {lot.origin}</span>}
                  </div>
                  <div className="lot-id muted small">ID: {lot.id}</div>
                </div>
              ))}
            </div>
          )}
      </section>

      <section className="panel">
        <h2 className="panel-title">{t.offers}</h2>
        {offers.length === 0
          ? <p className="muted">{t.noOffersYet}</p>
          : offers.map((offer, i) => (
            <div className="offer-card" key={i}>
              <div>
                <strong>{fmt(offer.price)}/qtl</strong>
                <span className="muted small"> · Lot {offer.lot}</span>
              </div>
              <div className="offer-actions">
                <button className="btn-accept">{t.accept}</button>
                <button className="btn-reject">{t.reject}</button>
              </div>
            </div>
          ))}
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRANSACTIONS TAB
═══════════════════════════════════════════════════════════════ */
function TransactionsTab({ t, apiBase }) {
  const [txns, setTxns] = useState([]);
  useEffect(() => {
    fetch(`${apiBase}/transactions/`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.transactions) setTxns(d.transactions); })
      .catch(() => {});
  }, [apiBase]);

  return (
    <div className="tab-content">
      <h2 className="panel-title"><IconReceipt /> {t.transactions}</h2>
      <section className="panel">
        {txns.length === 0
          ? <p className="muted">{t.noTransactions}</p>
          : (
            <table className="market-table">
              <thead><tr><th>ID</th><th>Lot</th><th>Amount</th><th>Delivery</th><th>Payment</th></tr></thead>
              <tbody>
                {txns.map((tx, i) => (
                  <tr key={tx.id || i}>
                    <td className="small muted">{tx.id || "—"}</td>
                    <td>{tx.lot_id || "—"}</td>
                    <td><strong>{fmt(tx.amount)}</strong></td>
                    <td><span className={`status-pill status-${(tx.delivery_status||"").toLowerCase()}`}>{tx.delivery_status || "—"}</span></td>
                    <td><span className={`status-pill status-${(tx.payment_status||"").toLowerCase()}`}>{tx.payment_status || "—"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HELP TAB
═══════════════════════════════════════════════════════════════ */
function HelpTab({ t, apiBase }) {
  const [open, setOpen] = useState(null);
  const [form, setForm] = useReducer((s, p) => ({ ...s, ...p }), { farmer_name: "", contact: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    if (!form.description.trim()) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${apiBase}/grievances/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (r.ok) setSuccess(true);
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="tab-content">
      <h2 className="panel-title"><IconHelp /> {t.faq}</h2>
      <section className="panel">
        {t.faqs.map((item, i) => (
          <div className="faq-item" key={i}>
            <button className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
              {item.q} <span>{open === i ? "▲" : "▼"}</span>
            </button>
            {open === i && <p className="faq-a">{item.a}</p>}
          </div>
        ))}
      </section>

      <section className="panel">
        <h2 className="panel-title">{t.grievance}</h2>
        {success ? (
          <div className="notice success"><IconCheck /> {t.grievanceSuccess}</div>
        ) : (
          <>
            <div className="wizard-grid">
              <label className="field"><span>Your name</span>
                <input type="text" placeholder="Ram Kumar" value={form.farmer_name} onChange={e => setForm({ farmer_name: e.target.value })} />
              </label>
              <label className="field"><span>Phone / Contact</span>
                <input type="text" placeholder="9XXXXXXXXX" value={form.contact} onChange={e => setForm({ contact: e.target.value })} />
              </label>
            </div>
            <label className="field full-width">
              <span>{t.grievanceDesc}</span>
              <textarea rows={4} placeholder="Describe your problem…" value={form.description} onChange={e => setForm({ description: e.target.value })} />
            </label>
            <button className="btn-primary" onClick={submit} disabled={submitting || !form.description.trim()}>
              {submitting ? "Submitting…" : t.submit}
            </button>
          </>
        )}
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [lang, setLang]   = useState("en");
  const [active, setActive] = useState(0);   // tab index
  const [mobileNav, setMobileNav] = useState(false);
  const t = LANGS[lang] || LANGS.en;

  /* Filters */
  const [commodity, setCommodity] = useState("");
  const [quantity,  setQuantity]  = useState("5000");
  const [quality,   setQuality]   = useState("Grade A");
  const [state,     setState]     = useState("");
  const [district,  setDistrict]  = useState("");
  const [variety,   setVariety]   = useState("");
  const [commodityGroup, setCommodityGroup] = useState("");
  const [transportRate,  setTransportRate]  = useState("38");
  const [storageDays,    setStorageDays]    = useState("0");
  const [storageRate,    setStorageRate]    = useState("4.5");
  const [deliveryPref,   setDeliveryPref]   = useState("");
  const [marketFilter,   setMarketFilter]   = useState("");

  /* Data */
  const [markets,         setMarkets]         = useState(demoMarkets);
  const [recommendation,  setRecommendation]  = useState(null);
  const [decisionOptions, setDecisionOptions] = useState([]);
  const [ranking,         setRanking]         = useState(null);
  const [opportunities,   setOpportunities]   = useState([]);
  const [forecast,        setForecast]        = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [dataError,       setDataError]       = useState("");
  const [loading,         setLoading]         = useState(false);
  const [toast,           setToast]           = useState("");
  const [locations,       setLocations]       = useState({});
  const [isRecommendationPending, startTransition] = useTransition();

  const deferredState    = useDeferredValue(state);
  const deferredDistrict = useDeferredValue(district);
  const deferredCommodity = useDeferredValue(commodity);
  const deferredVariety   = useDeferredValue(variety);

  const availableStates   = useMemo(() => Object.keys(locations).length ? Object.keys(locations) : states, [locations]);
  const availableDistricts = useMemo(() =>
    deferredState && locations[deferredState] ? locations[deferredState] : [], [deferredState, locations]);

  /* Locations */
  const locationsRes = useApi(`${API_BASE_URL}/locations/`, { locations: {} });
  useEffect(() => { if (locationsRes.data?.locations) setLocations(locationsRes.data.locations); }, [locationsRes.data]);

  /* Auto-load markets */
  useEffect(() => {
    const ac = new AbortController();
    setDataError("");
    const params = new URLSearchParams();
    if (deferredCommodity) params.set("commodity", deferredCommodity);
    if (deferredState)     params.set("state", deferredState);
    if (deferredDistrict)  params.set("district", deferredDistrict);
    if (deferredVariety)   params.set("variety", deferredVariety);
    if (marketFilter)      params.set("market", marketFilter);
    if (commodityGroup)    params.set("commodity_group", commodityGroup);

    fetch(`${API_BASE_URL}/markets/?${params}`, { signal: ac.signal })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.markets?.length) setMarkets(d.markets); else setDataError(t.noMarkets); })
      .catch(e => { if (e.name !== "AbortError") setDataError(t.noMarkets); });
    return () => ac.abort();
  }, [deferredCommodity, deferredState, deferredDistrict, deferredVariety, marketFilter, commodityGroup, t.noMarkets]);

  /* Auto-load forecast */
  useEffect(() => {
    if (!markets.length) return;
    const ac = new AbortController();
    setForecastLoading(true);
    fetch(`${API_BASE_URL}/forecasts/`, {
      method: "POST", signal: ac.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prices: markets.map(m => Number(m.price)).filter(Boolean) }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setForecast(d); })
      .catch(() => {})
      .finally(() => setForecastLoading(false));
    return () => ac.abort();
  }, [markets]);

  /* Reset district when state changes */
  useEffect(() => {
    if (deferredDistrict && availableDistricts.length && !availableDistricts.includes(deferredDistrict))
      setDistrict("");
  }, [deferredDistrict, availableDistricts]);

  /* Run recommendation */
  const runRecommendation = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/recommendations/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commodity, state, district, market: marketFilter, commodity_group: commodityGroup,
          variety, quantity_kg: Number(quantity), quality,
          transport_rate: Number(transportRate), storage_days: Number(storageDays), storage_rate: Number(storageRate),
        }),
      });
      if (r.ok) {
        const d = await r.json();
        startTransition(() => { if (d.options?.length) setMarkets(d.options); });
        if (d.recommendation)  setRecommendation(d.recommendation);
        if (d.decision_options) setDecisionOptions(d.decision_options);
        if (d.ranking)          setRanking(d.ranking);
        setToast("✅ Selling plan updated!");
      } else throw new Error("failed");
    } catch {
      setMarkets(demoMarkets);
      setDataError("Live recommendations unavailable. Showing sample data.");
    } finally {
      setLoading(false);
    }
  }, [commodity, state, district, marketFilter, commodityGroup, variety, quantity, quality, transportRate, storageDays, storageRate]);

  const TABS = [
    { label: t.nav[0], icon: <IconHome /> },
    { label: t.nav[1], icon: <IconChart /> },
    { label: t.nav[2], icon: <IconLot /> },
    { label: t.nav[3], icon: <IconReceipt /> },
    { label: t.nav[4], icon: <IconHelp /> },
  ];

  const sharedProps = {
    t, markets, recommendation, decisionOptions, ranking, forecast, forecastLoading,
    quantity, setQuantity, quality, setQuality,
    state, setState, district, setDistrict,
    commodity, setCommodity, commodityGroup, setCommodityGroup,
    variety, setVariety, transportRate, setTransportRate,
    storageDays, setStorageDays, storageRate, setStorageRate,
    deliveryPref, setDeliveryPref,
    runRecommendation, loading, isRecommendationPending,
    availableStates, availableDistricts, dataError, lang,
  };

  return (
    <div className="app-shell">
      {/* ── Sidebar (desktop) ── */}
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark"><IconSeed /></span>
          <div>
            <strong>{t.appName}</strong>
            <span>{t.tagline}</span>
          </div>
        </div>

        <div className="lang-switch">
          {["en", "hi"].map(l => (
            <button key={l} className={`lang-btn ${lang === l ? "active" : ""}`} onClick={() => setLang(l)}>
              {l === "en" ? "EN" : "हि"}
            </button>
          ))}
        </div>

        <nav className="sidebar-nav">
          {TABS.map((tab, i) => (
            <button
              key={i}
              className={`nav-item ${active === i ? "nav-active" : ""}`}
              onClick={() => { setActive(i); setMobileNav(false); }}
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
          <button className="mobile-menu-btn" onClick={() => setMobileNav(s => !s)} aria-label="Menu">
            <IconMenu />
          </button>
          <span className="topbar-title">{t.appName}</span>
          <div className="topbar-right">
            {["en", "hi"].map(l => (
              <button key={l} className={`lang-btn-sm ${lang === l ? "active" : ""}`} onClick={() => setLang(l)}>
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
            <button key={i} className={`bottom-nav-btn ${active === i ? "active" : ""}`} onClick={() => setActive(i)}>
              {tab.icon}<span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <main className="main-content">
          {active === 0 && <HomeTab {...sharedProps} />}
          {active === 1 && <MarketsTab {...sharedProps} />}
          {active === 2 && <MyLotsTab t={t} apiBase={API_BASE_URL} />}
          {active === 3 && <TransactionsTab t={t} apiBase={API_BASE_URL} />}
          {active === 4 && <HelpTab t={t} apiBase={API_BASE_URL} />}
        </main>
      </div>

      <Toast msg={toast} onDone={() => setToast("")} />
    </div>
  );
}
