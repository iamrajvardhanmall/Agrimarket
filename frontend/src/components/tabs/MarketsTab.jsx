import { useState, useEffect } from "react";
import {
  HBarChart,
  PriceRangeChart,
  ForecastLineChart,
  PriceVsNetChart,
  ArrivalBubbleChart,
} from "../charts/Charts";
import { IconStar, IconWarn, IconUp, IconDown, IconCalendar } from "../common/Icons";
import { fmt, fmtNum } from "../../utils/formatters";
import { demoMarkets } from "../../constants/marketData";
import { API_BASE_URL } from "../../constants/config";

export function MarketsTab({ t, markets, ranking, forecast, forecastLoading, dataError }) {
  const [chartTab, setChartTab] = useState("range");

  /* ── Market-table filter state ── */
  const [mktCommodity, setMktCommodity] = useState("");
  const [mktState,     setMktState]     = useState("");
  const [mktDistrict,  setMktDistrict]  = useState("");
  const [mktMarket,    setMktMarket]    = useState("");
  const [mktVariety,   setMktVariety]   = useState("");
  const [mktGrade,     setMktGrade]     = useState("");
  const [mktLoading,   setMktLoading]   = useState(false);
  const [mktData,      setMktData]      = useState(null);

  const CHART_TABS = [
    { id: "range",    label: "📏 Price Range" },
    { id: "earnings", label: "💰 Earnings Compare" },
    { id: "arrivals", label: "🚜 Market Volume" },
    { id: "net",      label: "📊 Net Realization" },
  ];

  /* ── Conditioned forecast state ── */
  const [fcState,     setFcState]     = useState("");
  const [fcDistrict,  setFcDistrict]  = useState("");
  const [fcMarket,    setFcMarket]    = useState("");
  const [fcCommodity, setFcCommodity] = useState("");
  const [fcVariety,   setFcVariety]   = useState("");
  const [fcGrade,     setFcGrade]     = useState("");
  const [fcData,      setFcData]      = useState(null);
  const [fcLoading,   setFcLoading]   = useState(false);
  const [fcMeta,      setFcMeta]      = useState({ commodities: [], grades: [], locations: {}, markets_by_district: {} });

  /* Load dropdown metadata once */
  useEffect(() => {
    fetch(`${API_BASE_URL}/forecast/metadata/`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setFcMeta(d); })
      .catch(() => {});
  }, []);

  /* Fetch conditioned forecast whenever any filter changes */
  useEffect(() => {
    if (!fcCommodity && !fcState) { setFcData(null); return; }
    const params = new URLSearchParams();
    if (fcState)     params.set("state",     fcState);
    if (fcDistrict)  params.set("district",  fcDistrict);
    if (fcMarket)    params.set("market",    fcMarket);
    if (fcCommodity) params.set("commodity", fcCommodity);
    if (fcVariety)   params.set("variety",   fcVariety);
    if (fcGrade)     params.set("grade",     fcGrade);
    setFcLoading(true);
    fetch(`${API_BASE_URL}/forecast/conditioned/?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && !d.error) setFcData(d); })
      .catch(() => {})
      .finally(() => setFcLoading(false));
  }, [fcState, fcDistrict, fcMarket, fcCommodity, fcVariety, fcGrade]);

  /* Fetch filtered markets whenever any market filter changes */
  useEffect(() => {
    if (!mktCommodity && !mktState && !mktDistrict && !mktMarket) {
      setMktData(null);
      return;
    }
    const params = new URLSearchParams();
    if (mktState)     params.set("state",     mktState);
    if (mktDistrict)  params.set("district",  mktDistrict);
    if (mktMarket)    params.set("market",    mktMarket);
    if (mktCommodity) params.set("commodity", mktCommodity);
    if (mktVariety)   params.set("variety",   mktVariety);
    if (mktGrade)     params.set("grade",     mktGrade);
    setMktLoading(true);
    fetch(`${API_BASE_URL}/markets/?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.markets?.length) setMktData(d.markets); })
      .catch(() => {})
      .finally(() => setMktLoading(false));
  }, [mktState, mktDistrict, mktMarket, mktCommodity, mktVariety, mktGrade]);

  /* Helpers */
  const displayMarkets        = mktData || markets;
  const fcStateDistricts      = fcMeta.locations?.[fcState]              || [];
  const mktStateDistricts     = fcMeta.locations?.[mktState]             || [];
  const mktDistrictMarkets    = fcMeta.markets_by_district?.[mktDistrict] || [];
  const fcDistrictMarkets = fcMeta.markets_by_district?.[fcDistrict] || [];
  const matchColors = {
    exact: "#186b50",
    district_grade: "#2a7a5f",
    district: "#3d8f70",
    state: "#c08000",
    commodity: "#e07000",
    baseline: "#b04040",
  };
  const trendIcon = (d) =>
    d === "rising" ? "📈" : d === "falling" ? "📉" : "📊";
  const noticeCls = (d) =>
    d === "rising" ? "success" : d === "falling" ? "warn" : "info";

  const best = displayMarkets[0] || demoMarkets[0];

  return (
    <div className="tab-content">
      <div className="panel-heading-row">
        <h2 className="panel-title">{t.compare}</h2>
        {ranking?.highest_profit_route && (
          <span className="badge-green"><IconStar /> {ranking.highest_profit_route.market}</span>
        )}
      </div>
      {dataError && <div className="notice warn"><IconWarn /> {dataError}</div>}

      {/* ── Market Filters ── */}
      <section className="panel">
        <h2 className="panel-title">🔍 Filter Markets</h2>
        <div className="fc-filter-grid">
          <label>
            🌾 Commodity
            <select value={mktCommodity} onChange={(e) => { setMktCommodity(e.target.value); setMktData(null); }}>
              <option value="">— Any crop —</option>
              {fcMeta.commodities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            📍 State
            <select value={mktState} onChange={(e) => { setMktState(e.target.value); setMktDistrict(""); setMktMarket(""); setMktData(null); }}>
              <option value="">— Any state —</option>
              {Object.keys(fcMeta.locations || {}).sort().map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>
            🏘️ District
            <select
              value={mktDistrict}
              onChange={(e) => { setMktDistrict(e.target.value); setMktMarket(""); setMktData(null); }}
              disabled={!mktState}
            >
              <option value="">— Any district —</option>
              {mktStateDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label>
            🏪 Market
            <select value={mktMarket} onChange={(e) => { setMktMarket(e.target.value); setMktData(null); }} disabled={!mktDistrict}>
              <option value="">— Any market —</option>
              {mktDistrictMarkets.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label>
            🌿 Variety
            <input
              type="text"
              value={mktVariety}
              placeholder="e.g. Hybrid, Desi…"
              onChange={(e) => { setMktVariety(e.target.value); setMktData(null); }}
            />
          </label>
          <label>
            🏷️ Grade
            <select value={mktGrade} onChange={(e) => { setMktGrade(e.target.value); setMktData(null); }}>
              <option value="">— Any grade —</option>
              {fcMeta.grades.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
        </div>

        {/* Active filter tags */}
        {(mktCommodity || mktState || mktDistrict || mktMarket || mktVariety || mktGrade) && (
          <div className="filter-tags">
            {mktCommodity && <span className="filter-tag" onClick={() => { setMktCommodity(""); setMktData(null); }}>🌾 {mktCommodity} ×</span>}
            {mktGrade     && <span className="filter-tag" onClick={() => { setMktGrade(""); setMktData(null); }}>🏷️ {mktGrade} ×</span>}
            {mktState     && <span className="filter-tag" onClick={() => { setMktState(""); setMktDistrict(""); setMktMarket(""); setMktData(null); }}>📍 {mktState} ×</span>}
            {mktDistrict  && <span className="filter-tag" onClick={() => { setMktDistrict(""); setMktMarket(""); setMktData(null); }}>🏘️ {mktDistrict} ×</span>}
            {mktMarket    && <span className="filter-tag" onClick={() => { setMktMarket(""); setMktData(null); }}>🏪 {mktMarket} ×</span>}
            {mktVariety   && <span className="filter-tag" onClick={() => { setMktVariety(""); setMktData(null); }}>🌿 {mktVariety} ×</span>}
          </div>
        )}
        {mktLoading && <p className="loading-text">Loading markets…</p>}
      </section>

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
              {displayMarkets.map((m, i) => (
                <tr key={m.id || m.name} className={i === 0 ? "best-row" : ""}>
                  <td><span className={`rank-badge rank-${i + 1}`}>{m.rank || i + 1}</span></td>
                  <td>
                    <strong>{m.name}</strong>
                    {i === 0 && <span className="best-badge">★ Best</span>}
                    <div className="muted small">{m.district}</div>
                  </td>
                  <td><strong>{fmt(m.price)}</strong></td>
                  <td className="muted small">{fmtNum(m.min_price)} / {fmtNum(m.max_price)}</td>
                  <td>{m.distance ? `${m.distance} km` : "—"}</td>
                  <td><span className={`demand-pill demand-${(m.demand || "").toLowerCase()}`}>{m.demand || "—"}</span></td>
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

      {/* ── Chart explorer ── */}
      <section className="panel">
        <h2 className="panel-title">📈 Market charts</h2>
        <p className="chart-hint muted small">
          Switch between charts to understand pricing, volumes, and what you'll earn at each market.
        </p>

        {/* Chart tabs */}
        <div className="chart-tabs">
          {CHART_TABS.map((ct) => (
            <button
              key={ct.id}
              className={`chart-tab-btn ${chartTab === ct.id ? "active" : ""}`}
              onClick={() => setChartTab(ct.id)}
            >
              {ct.label}
            </button>
          ))}
        </div>

        <div className="chart-box">
          {chartTab === "range" && (
            <>
              <h3 className="chart-title">📏 Price Range — Compare Markets at a Glance</h3>
              <p className="chart-desc muted small">
                The <strong>filled dot</strong> is today's modal price. The <strong>green bar</strong> shows what you'll actually earn (net).
                The dashed line is the best market's price — your benchmark. <strong>+% / −%</strong> shows how much you gain or lose vs that benchmark.
              </p>
              <PriceRangeChart data={displayMarkets} />
              <div className="chart-legend-row">
                <span className="legend-dot" style={{ background: "#186b50" }} /> Modal price (dot)
                &nbsp;·&nbsp;
                <span style={{ display:"inline-block", width:10, height:10, background:"#27ae60", borderRadius:2, verticalAlign:"middle" }} /> Net you earn
                &nbsp;·&nbsp;
                <span style={{ display:"inline-block", width:28, borderTop:"2px dashed #186b50", verticalAlign:"middle" }} /> Best market benchmark
              </div>
            </>
          )}
          {chartTab === "earnings" && (
            <>
              <h3 className="chart-title">💰 Modal Price vs What You'll Actually Earn</h3>
              <p className="chart-desc muted small">
                Light bar = market's modal price. Dark bar = your <strong>take-home after transport &amp; storage</strong>.
                The badge above each pair shows the <strong>profit delta</strong> — how much more (or less) you earn vs the modal price.
              </p>
              <PriceVsNetChart data={displayMarkets} />
            </>
          )}
          {chartTab === "arrivals" && (
            <>
              <h3 className="chart-title">🚜 Supply Volume vs Modal Price — Spot Oversupply Risk</h3>
              <p className="chart-desc muted small">
                Each bubble's <strong>size = quantity arriving</strong> at that market. The price inside is today's modal.
                <strong> Big bubble + low price</strong> = oversupply, avoid selling there. <strong>Small bubble + high price</strong> = scarcity premium, ideal to sell.
              </p>
              <ArrivalBubbleChart data={displayMarkets} />
            </>
          )}
          {chartTab === "net" && (
            <>
              <h3 className="chart-title">📊 Net Profit Ranking — Best Market Highlighted</h3>
              <p className="chart-desc muted small">
                Bars show your <strong>net realization</strong> (take-home after all costs) per market.
                The dashed line marks the <strong>best market's modal price</strong> as a reference.
                The <strong>% column</strong> on the right shows how much each market lags behind the best.
              </p>
              <HBarChart data={displayMarkets} valueKey="net_realization" label="Net realization per market" />
            </>
          )}
        </div>
      </section>

      {/* ── Conditioned Forecast ── */}
      <section className="panel">
        <h2 className="panel-title"><IconCalendar /> 📅 Price forecast (next 7 days)</h2>
        <p className="chart-desc muted small">
          Select your crop and location below to get a price forecast tailored to your market.
        </p>

        {/* Filter grid */}
        <div className="fc-filter-grid">
          <label>
            🌾 Commodity
            <select value={fcCommodity} onChange={(e) => { setFcCommodity(e.target.value); setFcVariety(""); }}>
              <option value="">— Any crop —</option>
              {fcMeta.commodities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            📍 State
            <select value={fcState} onChange={(e) => { setFcState(e.target.value); setFcDistrict(""); setFcMarket(""); }}>
              <option value="">— Any state —</option>
              {Object.keys(fcMeta.locations || {}).sort().map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>
            🏘️ District
            <select
              value={fcDistrict}
              onChange={(e) => { setFcDistrict(e.target.value); setFcMarket(""); }}
              disabled={!fcState}
            >
              <option value="">— Any district —</option>
              {fcStateDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label>
            🏪 Market
            <select value={fcMarket} onChange={(e) => setFcMarket(e.target.value)} disabled={!fcDistrict}>
              <option value="">— Any market —</option>
              {fcDistrictMarkets.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label>
            🌿 Variety
            <input
              type="text"
              value={fcVariety}
              placeholder="e.g. Hybrid, Desi…"
              onChange={(e) => setFcVariety(e.target.value)}
            />
          </label>
          <label>
            🏷️ Grade
            <select value={fcGrade} onChange={(e) => setFcGrade(e.target.value)}>
              <option value="">— Any grade —</option>
              {fcMeta.grades.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
        </div>

        {/* Active filter tags */}
        {(fcCommodity || fcState || fcDistrict || fcMarket || fcVariety || fcGrade) && (
          <div className="filter-tags">
            {fcCommodity && <span className="filter-tag" onClick={() => setFcCommodity("")}>🌾 {fcCommodity} ×</span>}
            {fcGrade     && <span className="filter-tag" onClick={() => setFcGrade("")}>🏷️ {fcGrade} ×</span>}
            {fcState     && <span className="filter-tag" onClick={() => { setFcState(""); setFcDistrict(""); setFcMarket(""); }}>📍 {fcState} ×</span>}
            {fcDistrict  && <span className="filter-tag" onClick={() => { setFcDistrict(""); setFcMarket(""); }}>🏘️ {fcDistrict} ×</span>}
            {fcMarket    && <span className="filter-tag" onClick={() => setFcMarket("")}>🏪 {fcMarket} ×</span>}
            {fcVariety   && <span className="filter-tag" onClick={() => setFcVariety("")}>🌿 {fcVariety} ×</span>}
          </div>
        )}

        {fcLoading && <p className="loading-text">Calculating forecast…</p>}

        {!fcLoading && fcData && (
          <>
            <div className="fc-meta-row">
              <span>
                Data source: <strong style={{ color: matchColors[fcData.match_level] || "#186b50" }}>
                  {fcData.match_level?.replace("_", " ")}
                </strong>
                &nbsp;·&nbsp;{fcData.observations} records
              </span>
              <span className="fc-confidence">
                Confidence&nbsp;
                <span className="fc-conf-bg">
                  <span
                    className="fc-conf-fill"
                    style={{
                      width: `${fcData.confidence || 0}%`,
                      background: (fcData.confidence || 0) >= 85 ? "#186b50"
                                : (fcData.confidence || 0) >= 75 ? "#c08000" : "#b04040",
                    }}
                  />
                </span>
                {fcData.confidence}%
              </span>
            </div>

            <div className={`notice ${noticeCls(fcData.trend_direction)}`} style={{ marginBottom: 14 }}>
              {trendIcon(fcData.trend_direction)}&nbsp;
              <strong>{fcData.advice}</strong>
            </div>

            <ForecastLineChart forecast={fcData} />

            <div className="forecast-row">
              {Array.from({ length: 7 }, (_, i) => i + 1).map((d) => {
                const b   = fcData.bounds?.[`${d}_day`] || {};
                const val = Number(fcData.forecasts?.[`${d}_day`]) || b.modal || 0;
                const prev = d === 1 ? val : Number(fcData.forecasts?.[`${d - 1}_day`]) || val;
                const up   = val >= prev;
                const dt = new Date();
                dt.setDate(dt.getDate() + d);
                const dateLabel = `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`;
                const weekday   = dt.toLocaleString("en-IN", { weekday: "short" });
                return (
                  <div className="forecast-day" key={d}>
                    <span className="fd-label">{dateLabel}</span>
                    <span className="fd-weekday">{weekday}</span>
                    <strong className="fd-val">{fmt(val)}</strong>
                    {b.min && b.max && (
                      <span className="fd-range">{fmtNum(b.min)} – {fmtNum(b.max)}</span>
                    )}
                    <span className={d === 1 ? "" : up ? "fd-up" : "fd-dn"}>
                      {d > 1 ? (up ? "↑" : "↓") : ""}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="fc-summary">
              Forecast for:&nbsp;
              {[fcCommodity, fcGrade, fcMarket || fcDistrict || fcState].filter(Boolean).join(" · ")}
              &nbsp;·&nbsp;Match level: {fcData.match_level?.replace("_", " ")}
              &nbsp;·&nbsp;Confidence: {fcData.confidence}%
              &nbsp;·&nbsp;Trend: {fcData.trend_direction} ({fcData.trend_percent > 0 ? "+" : ""}{fcData.trend_percent?.toFixed(1)}%)
            </p>
          </>
        )}

        {!fcLoading && !fcData && (
          <div className="fc-empty">
            <span style={{ fontSize: 32 }}>🌾</span>
            <p style={{ marginTop: 8 }}>
              Select at least a <strong>Commodity</strong> or <strong>State</strong> above to generate a conditioned price forecast.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

