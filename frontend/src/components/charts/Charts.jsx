import { fmt, fmtNum } from "../../utils/formatters";

/* ─── Shared constants ──────────────────────────────────────────── */
const G    = "#186b50";   // brand green – best market
const GL   = "#4caf82";   // lighter green – other markets
const RED  = "#c0392b";   // loss / oversupply
const GOLD = "#c47f00";   // medium / warning
const EARN = "#1a8f65";   // "you earn" accent
const TRACK = "#e8e3d8";  // bar track background

const shortName = (s) =>
  (s || "").replace(/ APMC/gi, "").replace(/ Market/gi, "").replace(/ Mandi/gi, "").trim();

/* Tooltip wrapper */
function Tip({ text, children }) {
  return (
    <span title={text} style={{ cursor: "default" }}>{children}</span>
  );
}

/* Badge chip */
function Badge({ val, positive }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
      background: positive ? "#e8f5e9" : "#fdecea",
      color: positive ? EARN : RED,
    }}>
      {positive ? "▲" : "▼"} {val}
    </span>
  );
}

/* Empty state */
function Empty({ msg = "No market data available." }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 16px", color: "#aaa", fontSize: 14 }}>
      📭 {msg}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   1. PRICE RANGE CHART
   Horizontal bar per market: price range (min→max), modal dot,
   net-earn marker, best-market dashed benchmark.
   ════════════════════════════════════════════════════════════════ */
export function PriceRangeChart({ data }) {
  if (!data?.length) return <Empty />;

  const allP = data.flatMap((d) =>
    [d.min_price, d.price, d.max_price, d.net_realization].map(Number).filter(Boolean)
  );
  const lo    = Math.min(...allP) * 0.95;
  const hi    = Math.max(...allP) * 1.05;
  const range = hi - lo || 1;
  const pct   = (v) => `${(((Number(v) || lo) - lo) / range) * 100}%`;

  const bestModal = Number(data[0]?.price) || 0;
  const refPct    = pct(bestModal);

  return (
    <div>
      {/* Legend */}
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 16, fontSize: 12, color: "#666" }}>
        {[
          { color: G,         shape: "circle", label: "Modal price (best)" },
          { color: GL,        shape: "circle", label: "Modal price (others)" },
          { color: "#a8d4bd", shape: "bar",    label: "Price range (min–max)" },
          { color: EARN,      shape: "tick",   label: "Your net earnings" },
          { color: G,         shape: "dashed", label: "Best market benchmark" },
        ].map(({ color, shape, label }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {shape === "circle" && <span style={{ width: 12, height: 12, borderRadius: "50%", background: color, display: "inline-block", border: "2px solid #fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />}
            {shape === "bar"    && <span style={{ width: 20, height: 6, borderRadius: 3, background: color, display: "inline-block" }} />}
            {shape === "tick"   && <span style={{ width: 3, height: 14, borderRadius: 2, background: color, display: "inline-block" }} />}
            {shape === "dashed" && <span style={{ width: 20, borderTop: "2px dashed " + color, display: "inline-block", verticalAlign: "middle" }} />}
            {label}
          </span>
        ))}
      </div>

      {/* Axis labels */}
      <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: 120, marginBottom: 4, fontSize: 10, color: "#bbb" }}>
        <span>{fmt(lo)}</span>
        <span style={{ color: G, fontWeight: 600 }}>← Best {fmt(bestModal)}</span>
        <span>{fmt(hi)}</span>
      </div>

      {/* Chart rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {data.map((d, i) => {
          const modal  = Number(d.price) || 0;
          const net    = Number(d.net_realization) || 0;
          const minP   = Number(d.min_price) || modal;
          const maxP   = Number(d.max_price) || modal;
          const isBest = i === 0;
          const delta  = bestModal > 0 && !isBest
            ? Math.round(((modal - bestModal) / bestModal) * 100) : null;

          return (
            <div key={d.name || i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Market name */}
              <Tip text={d.name}>
                <div style={{
                  width: 120, minWidth: 120, fontSize: 12.5, textAlign: "right",
                  fontWeight: isBest ? 700 : 500,
                  color: isBest ? G : "#444",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {isBest && "★ "}{shortName(d.name)}
                </div>
              </Tip>

              {/* Bar track */}
              <div style={{ flex: 1, position: "relative", height: 36 }}>
                {/* Track */}
                <div style={{ position: "absolute", top: 13, left: 0, right: 0, height: 10, background: TRACK, borderRadius: 5 }} />

                {/* Price range fill */}
                <div style={{
                  position: "absolute", top: 13,
                  left: pct(minP), width: `calc(${pct(maxP)} - ${pct(minP)})`,
                  height: 10,
                  background: isBest ? "#7bc9a0" : "#bddece",
                  borderRadius: 5, minWidth: 3,
                }} />

                {/* Net earn marker */}
                {net > 0 && (
                  <Tip text={`Net earnings: ${fmt(net)}`}>
                    <div style={{
                      position: "absolute", left: pct(net), top: 7,
                      width: 4, height: 22, background: EARN, borderRadius: 2,
                      transform: "translateX(-50%)", zIndex: 3,
                    }}>
                      <div style={{
                        position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
                        fontSize: 9.5, color: EARN, fontWeight: 700, whiteSpace: "nowrap",
                        background: "#e8f5ec", padding: "1px 4px", borderRadius: 3,
                      }}>
                        Earn {fmt(net)}
                      </div>
                    </div>
                  </Tip>
                )}

                {/* Modal price dot */}
                <Tip text={`Modal price: ${fmt(modal)}`}>
                  <div style={{
                    position: "absolute", left: pct(modal), top: 8,
                    width: isBest ? 16 : 12, height: isBest ? 16 : 12,
                    borderRadius: "50%",
                    background: isBest ? G : GL,
                    border: "2.5px solid #fff",
                    boxShadow: "0 1px 5px rgba(0,0,0,.22)",
                    transform: "translateX(-50%)",
                    zIndex: 4,
                  }} />
                </Tip>

                {/* Modal price label (top) */}
                <div style={{
                  position: "absolute", left: pct(modal), top: -16,
                  transform: "translateX(-50%)",
                  fontSize: 11, fontWeight: isBest ? 700 : 500,
                  color: isBest ? G : "#666",
                  whiteSpace: "nowrap",
                }}>
                  {fmt(modal)}
                </div>

                {/* Best-market benchmark dashed line */}
                <div style={{
                  position: "absolute", left: refPct, top: 0, bottom: 0,
                  borderLeft: "1.5px dashed rgba(24,107,80,.5)",
                  pointerEvents: "none", zIndex: 2,
                }} />
              </div>

              {/* Badge */}
              <div style={{ width: 70, textAlign: "right" }}>
                {isBest
                  ? <span style={{ fontSize: 12, fontWeight: 700, color: G }}>★ Best</span>
                  : delta !== null
                    ? <Badge val={`${delta > 0 ? "+" : ""}${delta}%`} positive={delta >= 0} />
                    : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   2. EARNINGS COMPARE CHART
   Card per market: Modal price vs Net earnings side-by-side bars.
   ════════════════════════════════════════════════════════════════ */
export function PriceVsNetChart({ data }) {
  if (!data?.length) return <Empty />;

  const allVals = data.flatMap((d) => [Number(d.price), Number(d.net_realization)].filter(Boolean));
  const maxVal  = Math.max(...allVals, 1);

  return (
    <div>
      {/* Legend */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 18, fontSize: 12, color: "#666" }}>
        {[
          { color: "#a8d4bd", label: "Modal price (mandi rate)" },
          { color: G,         label: "You'll earn (after costs)" },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: color, display: "inline-block" }} />
            {label}
          </span>
        ))}
      </div>

      {/* Market cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        {data.map((d, i) => {
          const modal   = Number(d.price) || 0;
          const net     = Number(d.net_realization) || 0;
          const isBest  = i === 0;
          const diff    = net && modal ? net - modal : null;
          const diffPct = diff !== null && modal > 0 ? Math.round((diff / modal) * 100) : null;
          const modalPct = `${Math.round((modal / maxVal) * 100)}%`;
          const netPct   = net ? `${Math.round((net / maxVal) * 100)}%` : "0%";

          return (
            <div key={d.name || i} style={{
              flex: "1 1 160px", minWidth: 145, maxWidth: 220,
              background: isBest ? "#f0f9f4" : "#fafaf8",
              border: `2px solid ${isBest ? "#7bc9a0" : "#e5e0d6"}`,
              borderRadius: 14, padding: "14px 16px",
              boxShadow: isBest ? "0 3px 12px rgba(24,107,80,.15)" : "0 1px 4px rgba(0,0,0,.06)",
            }}>
              {/* Header */}
              <div style={{ fontSize: 12.5, fontWeight: 700, color: isBest ? G : "#333", marginBottom: 12,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {isBest && <span style={{ fontSize: 10, background: G, color: "#fff",
                  borderRadius: 4, padding: "2px 6px", marginRight: 6 }}>★ Best</span>}
                {shortName(d.name)}
              </div>

              {/* Modal price bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 4 }}>
                  <span>Modal price</span>
                  <span style={{ fontWeight: 600, color: "#555" }}>{fmt(modal)}</span>
                </div>
                <div style={{ background: TRACK, borderRadius: 5, height: 12, overflow: "hidden" }}>
                  <div style={{ width: modalPct, height: "100%", background: "#a8d4bd", borderRadius: 5, minWidth: 4 }} />
                </div>
              </div>

              {/* Net earn bar */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 4 }}>
                  <span>You'll earn</span>
                  <span style={{ fontWeight: 700, color: isBest ? G : "#444" }}>{net > 0 ? fmt(net) : "—"}</span>
                </div>
                <div style={{ background: TRACK, borderRadius: 5, height: 12, overflow: "hidden" }}>
                  {net > 0
                    ? <div style={{ width: netPct, height: "100%", background: isBest ? G : GL, borderRadius: 5, minWidth: 4 }} />
                    : <div style={{ height: "100%", display: "flex", alignItems: "center", paddingLeft: 8 }}>
                        <span style={{ fontSize: 10, color: "#bbb" }}>No data</span>
                      </div>}
                </div>
              </div>

              {/* Delta chip — shows transport+storage deduction from modal price */}
              {diffPct !== null
                ? (
                  <div>
                    <Badge val={`${diffPct >= 0 ? "+" : ""}${fmt(Math.abs(diff))} (${Math.abs(diffPct)}%)`} positive={diffPct >= 0} />
                    <div style={{ fontSize: 10, color: "#888", marginTop: 4, lineHeight: 1.4 }}>
                      {diffPct < 0
                        ? `₹${fmt(Math.abs(diff))} deducted as transport + storage costs`
                        : `₹${fmt(Math.abs(diff))} extra earned vs modal price`}
                    </div>
                  </div>
                )
                : <div style={{ fontSize: 11, color: "#bbb" }}>Profit data unavailable</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   3. MARKET VOLUME CHART
   Card per market: price bubble + supply-share bar.
   ════════════════════════════════════════════════════════════════ */
export function ArrivalBubbleChart({ data }) {
  if (!data?.length) return <Empty />;

  const vals   = data.map((d) => Number(d.arrival_quantity ?? d.arrival) || 0);
  const prices = data.map((d) => Number(d.price) || 0);
  const total  = vals.reduce((a, b) => a + b, 0) || 1;
  const maxP   = Math.max(...prices, 1);

  return (
    <div>
      {/* Legend */}
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 18, fontSize: 12, color: "#666" }}>
        {[
          { color: G,    label: "High price — good to sell" },
          { color: GOLD, label: "Medium price" },
          { color: RED,  label: "Low price / oversupply risk" },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 14, height: 14, borderRadius: "50%", background: color, display: "inline-block" }} />
            {label}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        {data.map((d, i) => {
          const v     = vals[i];
          const price = prices[i];
          const pct   = total > 0 ? Math.round((v / total) * 100) : 0;
          const pRatio = maxP > 0 ? price / maxP : 0;
          const isBest = i === 0;
          const isOverSupply = pct > 35;
          const bg = isBest ? G : pRatio > 0.75 ? GL : pRatio > 0.5 ? GOLD : RED;

          return (
            <div key={d.name || i} style={{
              flex: "1 1 150px", minWidth: 140, maxWidth: 200,
              borderRadius: 14,
              border: `2px solid ${isBest ? "#7bc9a0" : "#e5e0d6"}`,
              background: isBest ? "#f0f9f4" : "#fafaf8",
              padding: "14px 14px 12px",
              boxShadow: isBest ? "0 3px 10px rgba(24,107,80,.12)" : "none",
            }}>
              {/* Market name */}
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#222", marginBottom: 10,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {isBest && "★ "}{shortName(d.name)}
              </div>

              {/* Price bubble */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <div style={{
                  width: 76, height: 76, borderRadius: "50%", background: bg,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  color: "#fff", boxShadow: "0 3px 10px rgba(0,0,0,.18)",
                }}>
                  <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>{fmt(price)}</div>
                  <div style={{ fontSize: 10, opacity: 0.9, marginTop: 2 }}>₹/qtl</div>
                </div>
              </div>

              {/* Supply share bar */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 4 }}>
                  <span>Supply share</span>
                  <span style={{ fontWeight: 700, color: isOverSupply ? RED : "#555" }}>{pct}%</span>
                </div>
                <div style={{ background: TRACK, borderRadius: 4, height: 10, overflow: "hidden" }}>
                  <div style={{
                    width: `${pct}%`, height: "100%", borderRadius: 4,
                    background: isOverSupply ? RED : bg, minWidth: 2,
                  }} />
                </div>
              </div>

              {/* Quantity */}
              {v > 0 && (
                <div style={{ fontSize: 11, color: "#777", textAlign: "center", marginBottom: 6 }}>
                  {fmtNum(v)} kg arriving
                </div>
              )}

              {/* Signal tag */}
              {isOverSupply
                ? <div style={{ padding: "5px 8px", background: "#fdecea", borderRadius: 7, fontSize: 11, fontWeight: 700, color: RED, textAlign: "center" }}>
                    ⚠ Oversupply — price may fall
                  </div>
                : isBest
                  ? <div style={{ padding: "5px 8px", background: "#e8f5e9", borderRadius: 7, fontSize: 11, fontWeight: 700, color: G, textAlign: "center" }}>
                      ✓ Good supply level
                    </div>
                  : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   4. NET REALIZATION RANKING  — horizontal bar chart
   ════════════════════════════════════════════════════════════════ */
export function HBarChart({ data }) {
  if (!data?.length) return <Empty />;

  const nets   = data.map((d) => Number(d.net_realization) || 0);
  const modals = data.map((d) => Number(d.price) || 0);
  const allV   = [...nets, ...modals].filter(Boolean);
  const maxVal = Math.max(...allV, 1);

  const bestNet   = nets[0];
  const bestModal = modals[0];
  const refPct    = `${Math.round((bestModal / maxVal) * 100)}%`;

  return (
    <div>
      {/* Legend */}
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 14, fontSize: 12, color: "#666" }}>
        {[
          { color: G,  label: "Net take-home — best market" },
          { color: GL, label: "Net take-home — other markets" },
          { label: "dashed", isDash: true },
        ].map(({ color, label, isDash }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {isDash
              ? <span style={{ width: 20, borderTop: "2px dashed " + G, display: "inline-block", verticalAlign: "middle" }} />
              : <span style={{ width: 14, height: 14, borderRadius: 3, background: color, display: "inline-block" }} />}
            {isDash ? "Best modal price (reference)" : label}
          </span>
        ))}
      </div>

      {/* Axis labels */}
      <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: 128, marginBottom: 4, fontSize: 10, color: "#bbb" }}>
        <span>₹0</span>
        <span style={{ color: G, fontWeight: 600 }}>← Modal {fmt(bestModal)}</span>
        <span>{fmt(maxVal)}</span>
      </div>

      {/* Bar rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {data.map((d, i) => {
          const net    = nets[i];
          const modal  = modals[i];
          const isBest = i === 0;
          const netPct   = net   ? `${Math.round((net   / maxVal) * 100)}%` : "0%";
          const modalPct = modal ? `${Math.round((modal / maxVal) * 100)}%` : "0%";
          const vsBest   = bestNet > 0 && !isBest
            ? Math.round(((net - bestNet) / bestNet) * 100) : null;

          return (
            <div key={d.name || i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Market name */}
              <Tip text={d.name}>
                <div style={{
                  width: 120, minWidth: 120, fontSize: 12.5, textAlign: "right",
                  fontWeight: isBest ? 700 : 500,
                  color: isBest ? G : "#444",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {isBest && "★ "}{shortName(d.name)}
                </div>
              </Tip>

              {/* Bar track */}
              <div style={{ flex: 1, position: "relative", height: 38 }}>
                {/* Track */}
                <div style={{ position: "absolute", top: 13, left: 0, right: 0, height: 12, background: TRACK, borderRadius: 6 }} />

                {/* Net bar */}
                {net > 0 && (
                  <div style={{
                    position: "absolute", top: 13, left: 0,
                    width: netPct, height: 12,
                    background: isBest ? G : GL,
                    borderRadius: 6, minWidth: 4,
                  }} />
                )}

                {/* Modal tick */}
                {modal > 0 && (
                  <div style={{
                    position: "absolute", left: modalPct, top: 10,
                    width: 2.5, height: 18, background: "rgba(255,255,255,0.75)",
                    borderRadius: 1, transform: "translateX(-50%)", zIndex: 3,
                  }} />
                )}

                {/* Benchmark line */}
                <div style={{
                  position: "absolute", left: refPct, top: 0, bottom: 0,
                  borderLeft: "1.5px dashed rgba(24,107,80,.55)",
                  zIndex: 4, pointerEvents: "none",
                }} />

                {/* Value label */}
                <div style={{
                  position: "absolute", left: `calc(${netPct} + 7px)`, top: 13,
                  fontSize: 12, fontWeight: isBest ? 700 : 500,
                  color: isBest ? G : "#555", lineHeight: "12px",
                  whiteSpace: "nowrap",
                }}>
                  {net > 0 ? fmt(net) : <span style={{ color: "#bbb", fontSize: 10 }}>No data</span>}
                </div>
              </div>

              {/* Badge */}
              <div style={{ width: 72, textAlign: "right" }}>
                {isBest
                  ? <span style={{ fontSize: 12, fontWeight: 700, color: G }}>★ Best</span>
                  : vsBest !== null
                    ? <Badge val={`${vsBest >= 0 ? "+" : ""}${vsBest}%`} positive={vsBest >= 0} />
                    : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── 7-Day Forecast Line Chart (SVG) ─── */
export function ForecastLineChart({ forecast }) {
  if (!forecast?.forecasts) return null;
  const days   = Array.from({ length: 7 }, (_, i) => i + 1);
  const vals   = days.map((d) => Number(forecast.forecasts[`${d}_day`]) || 0);
  const minV   = Math.min(...vals) * 0.993;
  const maxV   = Math.max(...vals) * 1.007;
  const W = 500; const H = 170; const PAD = 44;
  const iW = W - PAD * 2; const iH = H - PAD * 2;
  const toX = (i) => PAD + (i / (days.length - 1)) * iW;
  const toY = (v) => PAD + iH - ((v - minV) / (maxV - minV || 1)) * iH;
  const pts  = days.map((_, i) => `${toX(i)},${toY(vals[i])}`).join(" ");
  const areaD =
    `M${toX(0)},${toY(vals[0])} ` +
    days.slice(1).map((_, i) => `L${toX(i + 1)},${toY(vals[i + 1])}`).join(" ") +
    ` L${toX(days.length - 1)},${PAD + iH} L${toX(0)},${PAD + iH} Z`;
  const rising = vals[vals.length - 1] > vals[0];
  const lineColor = rising ? G : RED;
  const today = new Date();
  const dayLabel = (offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString("en-IN", { month: "short" })}`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="svg-chart" aria-label="7-day price forecast">
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((f) => {
        const y = PAD + iH * (1 - f);
        const v = minV + (maxV - minV) * f;
        return (
          <g key={f}>
            <line x1={PAD} x2={PAD + iW} y1={y} y2={y} stroke="#e8e3d8" strokeWidth="1" />
            <text x={PAD - 5} y={y + 4} textAnchor="end" fontSize="10" fill="#aaa">{fmt(v)}</text>
          </g>
        );
      })}
      {/* Area fill */}
      <path d={areaD} fill={lineColor} opacity="0.08" />
      {/* Line */}
      <polyline points={pts} fill="none" stroke={lineColor} strokeWidth="2.5"
        strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots + labels */}
      {days.map((d, i) => (
        <g key={d}>
          <circle cx={toX(i)} cy={toY(vals[i])} r="5" fill={lineColor} />
          <circle cx={toX(i)} cy={toY(vals[i])} r="2.5" fill="#fff" />
          <text x={toX(i)} y={PAD + iH + 18} textAnchor="middle" fontSize="10" fill="#888">{dayLabel(d)}</text>
          <text x={toX(i)} y={toY(vals[i]) - 10} textAnchor="middle" fontSize="10.5"
            fill={lineColor} fontWeight="700">{fmt(vals[i])}</text>
        </g>
      ))}
      {/* Trend label */}
      <text x={PAD + iW} y={PAD - 8} textAnchor="end" fontSize="12" fill={lineColor} fontWeight="800">
        {rising ? "↑ Price rising" : "↓ Price falling"}
      </text>
    </svg>
  );
}
