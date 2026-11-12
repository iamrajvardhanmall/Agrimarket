import { fmt, fmtNum } from "../../utils/formatters";

/* ─── shared helpers ─── */
const shortName = (s) =>
  (s || "").replace(/ APMC/gi, "").replace(/ Market/gi, "").replace(/ Mandi/gi, "").trim();

const G     = "#186b50";   // brand green (best)
const GL    = "#6cb290";   // lighter green
const RED   = "#c0392b";   // loss / warning
const GOLD  = "#b8860b";   // medium
const EARN  = "#1a8f65";   // "you earn"

/* ════════════════════════════════════════════════════════════════
   1. PRICE RANGE  — horizontal range bar per market
      Modal price dot + "Earn" marker + % vs best benchmark
   ════════════════════════════════════════════════════════════════ */
export function PriceRangeChart({ data }) {
  if (!data?.length) return null;

  const allP = data.flatMap((d) =>
    [d.min_price, d.price, d.max_price, d.net_realization].map(Number).filter(Boolean)
  );
  const lo = Math.min(...allP) * 0.96;
  const hi = Math.max(...allP) * 1.04;
  const range = hi - lo || 1;
  const pct = (v) => `${(((Number(v) || lo) - lo) / range) * 100}%`;

  const bestModal = Number(data[0]?.price) || 0;
  const refPct    = pct(bestModal);

  return (
    <div style={{ padding: "4px 0 8px" }}>
      {/* Legend row */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 14, fontSize: 12, color: "#555" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: G, display: "inline-block" }} />
          Modal price (dot)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 12, height: 4, borderRadius: 2, background: "#a8d4bd", display: "inline-block" }} />
          Price range (min–max)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 3, height: 14, borderRadius: 2, background: EARN, display: "inline-block" }} />
          What you earn (net)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 20, borderTop: "2px dashed #186b50", display: "inline-block", verticalAlign: "middle" }} />
          Best market benchmark
        </span>
      </div>

      {/* Chart rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map((d, i) => {
          const modal  = Number(d.price) || 0;
          const net    = Number(d.net_realization) || 0;
          const minP   = Number(d.min_price) || modal;
          const maxP   = Number(d.max_price) || modal;
          const isBest = i === 0;
          const delta  = bestModal > 0 && modal > 0
            ? Math.round(((modal - bestModal) / bestModal) * 100) : null;

          return (
            <div key={d.name || i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Market name */}
              <div style={{
                width: 110, minWidth: 110, fontSize: 12, textAlign: "right",
                fontWeight: isBest ? 700 : 400,
                color: isBest ? G : "#555",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}>
                {isBest && "★ "}{shortName(d.name)}
              </div>

              {/* Bar track */}
              <div style={{ flex: 1, position: "relative", height: 28 }}>
                {/* Full track */}
                <div style={{
                  position: "absolute", top: 11, left: 0, right: 0,
                  height: 6, background: "#ece8de", borderRadius: 3
                }} />

                {/* Price range fill */}
                <div style={{
                  position: "absolute", top: 11,
                  left: pct(minP), width: `calc(${pct(maxP)} - ${pct(minP)})`,
                  height: 6, background: isBest ? "#a8d4bd" : "#c5ddd1", borderRadius: 3,
                  minWidth: 2
                }} />

                {/* Net earn marker */}
                {net > 0 && (
                  <div style={{
                    position: "absolute", left: pct(net), top: 6,
                    width: 3, height: 16, background: EARN, borderRadius: 2,
                    transform: "translateX(-50%)"
                  }}>
                    <div style={{ position: "absolute", bottom: 17, left: "50%", transform: "translateX(-50%)",
                      fontSize: 9, color: EARN, fontWeight: 700, whiteSpace: "nowrap" }}>
                      Earn
                    </div>
                  </div>
                )}

                {/* Modal price dot */}
                <div style={{
                  position: "absolute", left: pct(modal), top: 7,
                  width: isBest ? 14 : 11, height: isBest ? 14 : 11,
                  borderRadius: "50%",
                  background: isBest ? G : GL,
                  border: "2px solid #fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,.18)",
                  transform: "translateX(-50%)",
                  zIndex: 2
                }} />

                {/* Modal price label */}
                <div style={{
                  position: "absolute", left: pct(modal), top: -16,
                  transform: "translateX(-50%)",
                  fontSize: 11, fontWeight: isBest ? 700 : 500,
                  color: isBest ? G : "#666",
                  whiteSpace: "nowrap"
                }}>
                  {fmt(modal)}
                </div>

                {/* Best market benchmark dashed line */}
                <div style={{
                  position: "absolute", left: refPct, top: 0, bottom: 0,
                  borderLeft: "1.5px dashed rgba(24,107,80,.45)",
                  pointerEvents: "none"
                }} />
              </div>

              {/* Delta badge */}
              <div style={{ width: 54, textAlign: "right" }}>
                {delta !== null && !isBest ? (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 5px", borderRadius: 4,
                    background: delta >= 0 ? "#e8f5e9" : "#fdecea",
                    color: delta >= 0 ? EARN : RED
                  }}>
                    {delta >= 0 ? "+" : ""}{delta}%
                  </span>
                ) : isBest ? (
                  <span style={{ fontSize: 11, fontWeight: 700, color: G }}>★ Best</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   2. EARNINGS COMPARE  — card per market, modal vs take-home bars
      Profit delta shown as a clean chip, never overlapping.
   ════════════════════════════════════════════════════════════════ */
export function PriceVsNetChart({ data }) {
  if (!data?.length) return null;

  const allVals = data.flatMap((d) => [Number(d.price), Number(d.net_realization)].filter(Boolean));
  const maxVal  = Math.max(...allVals, 1);

  return (
    <div>
      {/* Legend */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16, fontSize: 12, color: "#555" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: "#a8d4bd", display: "inline-block" }} />
          Modal price (mandi rate)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: G, display: "inline-block" }} />
          You'll earn (after costs)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: "#e8f5e9", border: "1px solid #a8d4bd", display: "inline-block" }} />
          Profit delta vs modal
        </span>
      </div>

      {/* Market cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        {data.map((d, i) => {
          const modal  = Number(d.price) || 0;
          const net    = Number(d.net_realization) || 0;
          const isBest = i === 0;
          const diff   = net && modal ? net - modal : null;
          const diffPct = diff !== null && modal > 0 ? Math.round((diff / modal) * 100) : null;
          const modalPct = `${Math.round((modal / maxVal) * 100)}%`;
          const netPct   = net ? `${Math.round((net / maxVal) * 100)}%` : "0%";

          return (
            <div key={d.name || i} style={{
              flex: "1 1 150px", minWidth: 130, maxWidth: 200,
              background: isBest ? "#f0f9f4" : "#fafaf8",
              border: `1.5px solid ${isBest ? "#a8d4bd" : "#e5e0d6"}`,
              borderRadius: 12, padding: "12px 14px",
              boxShadow: isBest ? "0 2px 8px rgba(24,107,80,.12)" : "0 1px 3px rgba(0,0,0,.06)"
            }}>
              {/* Market name + best badge */}
              <div style={{ fontSize: 12, fontWeight: 700, color: isBest ? G : "#444", marginBottom: 8,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {isBest && <span style={{ fontSize: 10, background: G, color: "#fff",
                  borderRadius: 4, padding: "1px 5px", marginRight: 5 }}>★ Best</span>}
                {shortName(d.name)}
              </div>

              {/* Modal price bar */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 10, color: "#888", marginBottom: 3 }}>Modal price</div>
                <div style={{ background: "#ece8de", borderRadius: 4, height: 10, overflow: "hidden" }}>
                  <div style={{ width: modalPct, height: "100%", background: "#a8d4bd", borderRadius: 4,
                    transition: "width .4s ease", minWidth: 4 }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginTop: 2 }}>{fmt(modal)}</div>
              </div>

              {/* Net earn bar */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: "#888", marginBottom: 3 }}>You'll earn</div>
                <div style={{ background: "#ece8de", borderRadius: 4, height: 10, overflow: "hidden" }}>
                  {net > 0
                    ? <div style={{ width: netPct, height: "100%", background: isBest ? G : GL, borderRadius: 4,
                        transition: "width .4s ease", minWidth: 4 }} />
                    : <div style={{ height: "100%", display: "flex", alignItems: "center", paddingLeft: 6 }}>
                        <span style={{ fontSize: 9, color: "#bbb" }}>No data</span>
                      </div>
                  }
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: isBest ? G : "#444", marginTop: 2 }}>
                  {net > 0 ? fmt(net) : "—"}
                </div>
              </div>

              {/* Profit delta chip */}
              {diffPct !== null ? (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  background: diffPct >= 0 ? "#e8f5e9" : "#fdecea",
                  color: diffPct >= 0 ? EARN : RED,
                  fontWeight: 700, fontSize: 12, padding: "3px 8px", borderRadius: 20
                }}>
                  {diffPct >= 0 ? "▲" : "▼"}
                  {diffPct >= 0 ? "+" : ""}{fmt(Math.abs(diff))} ({Math.abs(diffPct)}%)
                </div>
              ) : (
                <div style={{ fontSize: 10, color: "#bbb" }}>Profit data unavailable</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   3. MARKET VOLUME  — supply card per market
      Price + supply share shown, oversupply flagged clearly.
   ════════════════════════════════════════════════════════════════ */
export function ArrivalBubbleChart({ data }) {
  if (!data?.length) return null;

  const vals   = data.map((d) => Number(d.arrival_quantity ?? d.arrival) || 0);
  const prices = data.map((d) => Number(d.price) || 0);
  const total  = vals.reduce((a, b) => a + b, 0) || 1;
  const maxP   = Math.max(...prices, 1);

  return (
    <div>
      {/* Legend */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16, fontSize: 12, color: "#555" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: G, display: "inline-block" }} />
          High price market
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: RED, display: "inline-block" }} />
          Lower price / oversupply risk
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
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
              flex: "1 1 140px", minWidth: 130, maxWidth: 190,
              borderRadius: 12,
              border: `1.5px solid ${isBest ? "#a8d4bd" : "#e5e0d6"}`,
              background: isBest ? "#f0f9f4" : "#fafaf8",
              padding: "12px 14px",
              boxShadow: isBest ? "0 2px 8px rgba(24,107,80,.12)" : "none"
            }}>
              {/* Market name */}
              <div style={{ fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 10,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {shortName(d.name)}
              </div>

              {/* Circular supply indicator */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                <div style={{
                  width: 68, height: 68, borderRadius: "50%",
                  background: bg,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,.15)"
                }}>
                  <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1 }}>{fmt(price)}</div>
                  <div style={{ fontSize: 10, opacity: 0.85, marginTop: 2 }}>modal</div>
                </div>
              </div>

              {/* Supply bar */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#888", marginBottom: 3 }}>
                  <span>Supply share</span>
                  <span style={{ fontWeight: 700, color: isOverSupply ? RED : "#555" }}>{pct}%</span>
                </div>
                <div style={{ background: "#ece8de", borderRadius: 4, height: 8, overflow: "hidden" }}>
                  <div style={{
                    width: `${pct}%`, height: "100%", borderRadius: 4,
                    background: isOverSupply ? RED : bg,
                    transition: "width .4s ease", minWidth: 2
                  }} />
                </div>
              </div>

              {/* Quantity */}
              {v > 0 && (
                <div style={{ fontSize: 11, color: "#777", textAlign: "center" }}>
                  {fmtNum(v)} kg arriving
                </div>
              )}

              {/* Oversupply warning */}
              {isOverSupply && (
                <div style={{
                  marginTop: 8, padding: "4px 8px", background: "#fdecea",
                  borderRadius: 6, fontSize: 11, fontWeight: 700, color: RED,
                  textAlign: "center"
                }}>
                  ⚠ Oversupply — price may fall
                </div>
              )}

              {/* Good sell signal */}
              {!isOverSupply && isBest && (
                <div style={{
                  marginTop: 8, padding: "4px 8px", background: "#e8f5e9",
                  borderRadius: 6, fontSize: 11, fontWeight: 700, color: G,
                  textAlign: "center"
                }}>
                  ✓ Good to sell here
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   4. NET REALIZATION RANKING  — horizontal bar ranking
      Modal price tick shown on each bar; % vs best on the right.
   ════════════════════════════════════════════════════════════════ */
export function HBarChart({ data, label }) {
  if (!data?.length) return null;

  const nets   = data.map((d) => Number(d.net_realization) || 0);
  const modals = data.map((d) => Number(d.price) || 0);
  const allV   = [...nets, ...modals].filter(Boolean);
  const maxVal = Math.max(...allV, 1);

  const bestNet   = nets[0];
  const bestModal = modals[0];

  // Reference line position (best modal price)
  const refPct = `${Math.round((bestModal / maxVal) * 100)}%`;

  return (
    <div style={{ padding: "4px 0 8px" }}>
      {/* Legend */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 14, fontSize: 12, color: "#555" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: G, display: "inline-block" }} />
          Net take-home (best market)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: GL, display: "inline-block" }} />
          Net take-home (other markets)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 20, borderTop: "2px dashed #186b50", display: "inline-block", verticalAlign: "middle" }} />
          Best modal price (reference)
        </span>
      </div>

      {/* Bar rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map((d, i) => {
          const net    = nets[i];
          const modal  = modals[i];
          const isBest = i === 0;
          const netPct   = net    ? `${Math.round((net    / maxVal) * 100)}%` : "0%";
          const modalPct = modal  ? `${Math.round((modal  / maxVal) * 100)}%` : "0%";
          const vsBest   = bestNet > 0 && !isBest
            ? Math.round(((net - bestNet) / bestNet) * 100) : null;

          return (
            <div key={d.name || i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Market name */}
              <div style={{
                width: 110, minWidth: 110, fontSize: 12, textAlign: "right",
                fontWeight: isBest ? 700 : 400,
                color: isBest ? G : "#555",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}>
                {isBest && "★ "}{shortName(d.name)}
              </div>

              {/* Bar track */}
              <div style={{ flex: 1, position: "relative", height: 32 }}>
                {/* Track */}
                <div style={{
                  position: "absolute", top: 11, left: 0, right: 0,
                  height: 10, background: "#ece8de", borderRadius: 5
                }} />

                {/* Net realization bar */}
                {net > 0 && (
                  <div style={{
                    position: "absolute", top: 11, left: 0,
                    width: netPct, height: 10,
                    background: isBest ? G : GL,
                    borderRadius: 5, minWidth: 4,
                    transition: "width .4s ease"
                  }} />
                )}

                {/* Modal price tick on this market's bar */}
                {modal > 0 && (
                  <div style={{
                    position: "absolute", left: modalPct, top: 8,
                    width: 2, height: 16, background: "rgba(255,255,255,0.7)",
                    borderRadius: 1, transform: "translateX(-50%)", zIndex: 2
                  }} />
                )}

                {/* Best market reference dashed line */}
                <div style={{
                  position: "absolute", left: refPct, top: 0, bottom: 0,
                  borderLeft: "1.5px dashed rgba(24,107,80,.5)",
                  pointerEvents: "none", zIndex: 3
                }} />

                {/* Value label */}
                <div style={{
                  position: "absolute", left: `calc(${netPct} + 6px)`, top: 11,
                  fontSize: 11, fontWeight: isBest ? 700 : 500,
                  color: isBest ? G : "#555", lineHeight: "10px",
                  whiteSpace: "nowrap"
                }}>
                  {net > 0 ? fmt(net) : <span style={{ color: "#bbb", fontSize: 10 }}>No data</span>}
                </div>
              </div>

              {/* vs Best badge */}
              <div style={{ width: 60, textAlign: "right" }}>
                {isBest ? (
                  <span style={{ fontSize: 11, fontWeight: 700, color: G }}>★ Best</span>
                ) : vsBest !== null ? (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                    background: vsBest >= 0 ? "#e8f5e9" : "#fdecea",
                    color: vsBest >= 0 ? EARN : RED
                  }}>
                    {vsBest >= 0 ? "+" : ""}{vsBest}%
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom axis labels */}
      <div style={{ display: "flex", justifyContent: "space-between",
        paddingLeft: 120, marginTop: 6, fontSize: 10, color: "#bbb" }}>
        <span>₹0</span>
        <span style={{ color: "#186b50", fontWeight: 600 }}>← Modal {fmt(bestModal)}</span>
        <span>{fmt(maxVal)}</span>
      </div>
    </div>
  );
}

/* ─── Forecast line chart (SVG, unchanged logic, cleaned up) ─── */
export function ForecastLineChart({ forecast }) {
  if (!forecast?.forecasts) return null;
  const days   = Array.from({ length: 7 }, (_, i) => i + 1);
  const vals   = days.map((d) => Number(forecast.forecasts[`${d}_day`]) || 0);
  const minV   = Math.min(...vals) * 0.995;
  const maxV   = Math.max(...vals) * 1.005;
  const W = 500; const H = 160; const PAD = 40;
  const iW = W - PAD * 2; const iH = H - PAD * 2;
  const toX = (i) => PAD + (i / (days.length - 1)) * iW;
  const toY = (v) => PAD + iH - ((v - minV) / (maxV - minV)) * iH;
  const pts  = days.map((_, i) => `${toX(i)},${toY(vals[i])}`).join(" ");
  const areaD =
    `M${toX(0)},${toY(vals[0])} ` +
    days.slice(1).map((_, i) => `L${toX(i + 1)},${toY(vals[i + 1])}`).join(" ") +
    ` L${toX(days.length - 1)},${PAD + iH} L${toX(0)},${PAD + iH} Z`;
  const rising = vals[vals.length - 1] > vals[0];
  const lineColor = rising ? "#186b50" : "#c0392b";
  const today = new Date();
  const dayLabel = (offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString("en-IN", { month: "short" })}`;
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="svg-chart" aria-label="7-day price forecast">
      {[0.25, 0.5, 0.75, 1].map((f) => {
        const y = PAD + iH * (1 - f);
        const v = minV + (maxV - minV) * f;
        return (
          <g key={f}>
            <line x1={PAD} x2={PAD + iW} y1={y} y2={y} stroke="#e8e4da" strokeWidth="1" />
            <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize="10" fill="#aaa">{fmt(v)}</text>
          </g>
        );
      })}
      <path d={areaD} fill={lineColor} opacity="0.08" />
      <polyline points={pts} fill="none" stroke={lineColor} strokeWidth="2.5"
        strokeLinejoin="round" strokeLinecap="round" />
      {days.map((d, i) => (
        <g key={d}>
          <circle cx={toX(i)} cy={toY(vals[i])} r="4" fill={lineColor} />
          <circle cx={toX(i)} cy={toY(vals[i])} r="2" fill="#fff" />
          <text x={toX(i)} y={PAD + iH + 16} textAnchor="middle" fontSize="10" fill="#888">{dayLabel(d)}</text>
          <text x={toX(i)} y={toY(vals[i]) - 10} textAnchor="middle" fontSize="10"
            fill={lineColor} fontWeight="600">{fmt(vals[i])}</text>
        </g>
      ))}
      <text x={PAD + iW} y={PAD - 6} textAnchor="end" fontSize="11" fill={lineColor} fontWeight="700">
        {rising ? "↑ Price rising" : "↓ Price falling"}
      </text>
    </svg>
  );
}
