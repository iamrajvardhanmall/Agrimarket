import { fmt, fmtNum } from "../../utils/formatters";

/* ─── shared helpers ─── */
const shortName = (s) =>
  (s || "").replace(/ APMC/gi, "").replace(/ Market/gi, "").replace(/ Mandi/gi, "");

const BEST_COLOR  = "#186b50";
const OTHER_COLOR = "#6cb290";
const COST_COLOR  = "#c0392b";
const PROFIT_COLOR = "#27ae60";

/* ════════════════════════════════════════════════════════════════
   1.  PRICE RANGE + PROFIT ZONE
       Shows min/modal/max per market with the profit gap highlighted.
       Modal price is the reference line everyone can compare against.
   ════════════════════════════════════════════════════════════════ */
export function PriceRangeChart({ data }) {
  if (!data.length) return null;

  const allPrices = data.flatMap((d) =>
    [d.min_price, d.price, d.max_price, d.net_realization].map(Number).filter(Boolean)
  );
  const minAll = Math.min(...allPrices) * 0.97;
  const maxAll = Math.max(...allPrices) * 1.03;

  const H  = 48;
  const LW = 140;
  const W  = 420;
  const height = data.length * H + 36;
  const toX = (v) => LW + ((Number(v) - minAll) / (maxAll - minAll)) * W;

  // Best market modal price as the reference line
  const bestModal = Number(data[0]?.price) || 0;
  const refX = toX(bestModal);

  return (
    <svg viewBox={`0 0 ${LW + W + 90} ${height}`} className="svg-chart" aria-label="Price range per market">
      {/* Reference line: Best modal price */}
      <line x1={refX} x2={refX} y1={0} y2={height - 20} stroke="#186b50" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
      <text x={refX} y={height - 6} textAnchor="middle" fontSize="9" fill="#186b50" fontWeight="700">
        Best ₹{fmtNum(bestModal)}
      </text>

      {/* X-axis labels */}
      <text x={LW} y={height - 6} fontSize="9" fill="#bbb">{fmt(minAll)}</text>
      <text x={LW + W} y={height - 6} fontSize="9" fill="#bbb" textAnchor="end">{fmt(maxAll)}</text>

      {data.map((d, i) => {
        const y       = i * H + 6;
        const xMin    = toX(d.min_price || d.price);
        const xModal  = toX(d.price);
        const xMax    = toX(d.max_price || d.price);
        const xNet    = toX(d.net_realization || d.price);
        const isBest  = i === 0;
        const profit  = Number(d.net_realization) || 0;
        const modal   = Number(d.price) || 0;
        const gap     = profit > 0 && modal > 0 ? Math.round(((profit - modal) / modal) * 100) : null;

        return (
          <g key={d.name || i}>
            {/* Market name */}
            <text x={LW - 8} y={y + H / 2 + 4} textAnchor="end" fontSize="11"
              fill={isBest ? BEST_COLOR : "#6b7e76"} fontWeight={isBest ? "700" : "400"}>
              {shortName(d.name)}
            </text>

            {/* Price range track */}
            <rect x={LW} y={y + H / 2 - 3} width={W} height={6} rx="3" fill="#f0ede4" />

            {/* Min–Max range bar */}
            <rect
              x={xMin} y={y + H / 2 - 3}
              width={Math.max(xMax - xMin, 2)} height={6} rx="3"
              fill={isBest ? "#a8d4bd" : "#c5ddd1"}
            />

            {/* Net-realization marker (what you actually earn) */}
            {d.net_realization && (
              <>
                <rect x={xNet - 2} y={y + H / 2 - 7} width={4} height={14} rx="1"
                  fill={PROFIT_COLOR} opacity="0.85" />
                <text x={xNet} y={y + H / 2 - 10} textAnchor="middle" fontSize="9" fill={PROFIT_COLOR} fontWeight="700">
                  Earn
                </text>
              </>
            )}

            {/* Modal price dot */}
            <circle cx={xModal} cy={y + H / 2} r={isBest ? 8 : 6}
              fill={isBest ? BEST_COLOR : OTHER_COLOR} />
            <circle cx={xModal} cy={y + H / 2} r={isBest ? 3 : 2} fill="#fff" />

            {/* Modal price label */}
            <text x={xModal} y={y + 11} textAnchor="middle" fontSize="10"
              fill={isBest ? BEST_COLOR : "#888"} fontWeight={isBest ? "700" : "500"}>
              {fmt(d.price)}
            </text>

            {/* Profit delta badge */}
            {gap !== null && (
              <text x={LW + W + 8} y={y + H / 2 + 4} fontSize="10"
                fill={gap >= 0 ? PROFIT_COLOR : COST_COLOR} fontWeight="700">
                {gap >= 0 ? `+${gap}%` : `${gap}%`}
              </text>
            )}

            {/* Tick marks */}
            <line x1={xMin} x2={xMin} y1={y + H / 2 - 6} y2={y + H / 2 + 6} stroke="#b0cfc0" strokeWidth="1.5" />
            <line x1={xMax} x2={xMax} y1={y + H / 2 - 6} y2={y + H / 2 + 6} stroke="#b0cfc0" strokeWidth="1.5" />
          </g>
        );
      })}
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   2.  EARNINGS COMPARE  — Modal vs Take-Home with Profit Delta
       Stacked bars + explicit ₹ profit annotation above each group.
   ════════════════════════════════════════════════════════════════ */
export function PriceVsNetChart({ data }) {
  if (!data.length) return null;

  const prices = data.map((d) => Number(d.price) || 0);
  const nets   = data.map((d) => Number(d.net_realization) || 0);
  const maxVal = Math.max(...prices, ...nets, 1);

  const BW  = 26;
  const GAP = 5;
  const GRP = 72;
  const PAD = 50;
  const H   = 210;
  const iH  = H - PAD - 30;
  const W   = data.length * GRP + PAD * 2;

  const toY = (v) => PAD + iH - (v / maxVal) * iH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="svg-chart" aria-label="Price vs earnings per market">
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((f) => {
        const y = PAD + iH * (1 - f);
        return (
          <g key={f}>
            <line x1={PAD} x2={W - PAD + 20} y1={y} y2={y} stroke="#e8e4da" strokeWidth="1" />
            <text x={PAD - 5} y={y + 4} textAnchor="end" fontSize="9" fill="#bbb">{fmt(maxVal * f)}</text>
          </g>
        );
      })}

      {/* Bars per market */}
      {data.map((d, i) => {
        const cx     = PAD + i * GRP + GRP / 2;
        const ph     = (prices[i] / maxVal) * iH;
        const nh     = (nets[i]   / maxVal) * iH;
        const pY     = toY(prices[i]);
        const nY     = toY(nets[i]);
        const isBest = i === 0;
        const diff   = nets[i] - prices[i];
        const diffPct = prices[i] > 0 ? Math.round((diff / prices[i]) * 100) : 0;
        const label  = shortName(d.name).split(" ")[0];

        return (
          <g key={d.name || i}>
            {/* Modal price bar (lighter) */}
            <rect
              x={cx - BW - GAP / 2} y={pY}
              width={BW} height={Math.max(ph, 2)} rx="3"
              fill={isBest ? "#a8d4bd" : "#c5ddd1"}
            />
            <text x={cx - BW / 2 - GAP / 2} y={pY - 4} textAnchor="middle"
              fontSize="9" fill="#666">
              {fmt(prices[i])}
            </text>

            {/* Net realization bar (darker = what you earn) */}
            <rect
              x={cx + GAP / 2} y={nY}
              width={BW} height={Math.max(nh, 2)} rx="3"
              fill={isBest ? BEST_COLOR : OTHER_COLOR}
            />
            <text x={cx + BW / 2 + GAP / 2} y={nY - 4} textAnchor="middle"
              fontSize="9" fill={isBest ? BEST_COLOR : OTHER_COLOR} fontWeight="700">
              {fmt(nets[i])}
            </text>

            {/* Profit delta label: ₹diff (pct%) */}
            <rect
              x={cx - 24} y={Math.min(pY, nY) - 22}
              width={48} height={16} rx="4"
              fill={diff >= 0 ? "#e8f5e9" : "#fdecea"}
            />
            <text x={cx} y={Math.min(pY, nY) - 11} textAnchor="middle"
              fontSize="10" fontWeight="700"
              fill={diff >= 0 ? PROFIT_COLOR : COST_COLOR}>
              {diff >= 0 ? "+" : ""}{fmt(diff)} ({diffPct >= 0 ? "+" : ""}{diffPct}%)
            </text>

            {/* Market name */}
            <text x={cx} y={PAD + iH + 16} textAnchor="middle" fontSize="10" fill="#6b7e76">{label}</text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x={PAD} y={8} width="11" height="11" rx="2" fill="#c5ddd1" />
      <text x={PAD + 15} y={18} fontSize="10" fill="#666">Modal price</text>
      <rect x={PAD + 90} y={8} width="11" height="11" rx="2" fill={BEST_COLOR} />
      <text x={PAD + 105} y={18} fontSize="10" fill="#666">You'll earn</text>
      <rect x={PAD + 180} y={8} width="11" height="11" rx="2" fill="#e8f5e9" />
      <text x={PAD + 195} y={18} fontSize="10" fill={PROFIT_COLOR} fontWeight="700">Profit delta</text>
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   3.  ARRIVAL VOLUME vs MODAL PRICE
       Bubble size = arrivals (supply). Modal price shown as a
       number inside. Farmers can spot: big bubble + low price
       means oversupply risk; small bubble + high price = good.
   ════════════════════════════════════════════════════════════════ */
export function ArrivalBubbleChart({ data }) {
  if (!data.length) return null;

  const vals   = data.map((d) => Number(d.arrival_quantity ?? d.arrival) || 50);
  const prices = data.map((d) => Number(d.price) || 0);
  const total  = vals.reduce((a, b) => a + b, 0) || 1;
  const maxV   = Math.max(...vals, 1);
  const maxP   = Math.max(...prices, 1);

  const W = 520; const CY = 90; const R_MAX = 54;
  const colors = [BEST_COLOR, OTHER_COLOR, "#a8d4bd", "#c5ddd1", "#6cb290"];
  const cx = (i) => 70 + i * ((W - 60) / Math.max(data.length, 1));

  return (
    <svg viewBox={`0 0 ${W} ${CY * 2 + 60}`} className="svg-chart" aria-label="Market arrival volume vs price">
      {data.map((d, i) => {
        const v    = vals[i];
        const r    = Math.max(14, (v / maxV) * R_MAX);
        const pct  = Math.round((v / total) * 100);
        const prc  = prices[i];
        const isBest = i === 0;
        // Colour: green bubble = high price, orange = low price
        const priceRatio = maxP > 0 ? prc / maxP : 0;
        const bubbleColor = isBest ? BEST_COLOR : priceRatio > 0.75 ? OTHER_COLOR : priceRatio > 0.5 ? "#b8860b" : "#c0392b";

        return (
          <g key={d.name || i}>
            {/* Arrival bubble */}
            <circle cx={cx(i)} cy={CY} r={r} fill={bubbleColor} opacity="0.9" />

            {/* Modal price inside bubble — comparison anchor */}
            <text x={cx(i)} y={CY - 4} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700">
              {fmt(prc)}
            </text>
            <text x={cx(i)} y={CY + 9} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.85)">
              modal
            </text>

            {/* Supply share below */}
            <text x={cx(i)} y={CY + r + 16} textAnchor="middle" fontSize="10" fill="#6b7e76" fontWeight="600">
              {shortName(d.name).split(" ")[0]}
            </text>
            <text x={cx(i)} y={CY + r + 29} textAnchor="middle" fontSize="9" fill="#aaa">
              {fmtNum(v)} kg · {pct}% supply
            </text>

            {/* Warning flag for oversupply */}
            {pct > 40 && (
              <text x={cx(i)} y={CY + r + 42} textAnchor="middle" fontSize="9" fill={COST_COLOR} fontWeight="700">
                ⚠ High supply
              </text>
            )}
          </g>
        );
      })}

      {/* Legend */}
      <circle cx={16} cy={CY * 2 + 48} r={6} fill={BEST_COLOR} />
      <text x={26} y={CY * 2 + 52} fontSize="9" fill="#666">Best price</text>
      <circle cx={90} cy={CY * 2 + 48} r={6} fill="#c0392b" />
      <text x={100} y={CY * 2 + 52} fontSize="9" fill="#666">Lower price</text>
      <text x={180} y={CY * 2 + 52} fontSize="9" fill="#aaa">Bigger bubble = more supply arriving</text>
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   4.  NET REALIZATION RANKING  — with modal price reference line
       Horizontal bars for take-home income.  A vertical dashed
       line marks the best-market modal price so farmers can see
       exactly how much each market lags behind in profit.
   ════════════════════════════════════════════════════════════════ */
export function HBarChart({ data, valueKey, label, color = BEST_COLOR }) {
  if (!data.length) return null;

  const nets     = data.map((d) => Number(d[valueKey]) || 0);
  const modals   = data.map((d) => Number(d.price) || 0);
  const allVals  = [...nets, ...modals];
  const maxVal   = Math.max(...allVals, 1);
  const bestNet  = nets[0];
  const bestModal = modals[0];

  const H  = 40;
  const LW = 148;
  const W  = 460;
  const height = data.length * H + 36;

  const toX = (v) => (v / maxVal) * W;
  const refX = LW + toX(bestModal);  // best-market modal price line

  return (
    <svg viewBox={`0 0 ${LW + W + 80} ${height}`} className="svg-chart" aria-label={label}>
      {/* Modal price reference line */}
      <line x1={refX} x2={refX} y1={0} y2={height - 22}
        stroke="#186b50" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.6" />
      <text x={refX} y={height - 8} textAnchor="middle" fontSize="9" fill="#186b50" fontWeight="700">
        Modal ₹{fmtNum(bestModal)}
      </text>

      {data.map((d, i) => {
        const val     = nets[i];
        const modal   = modals[i];
        const barW    = toX(val);
        const y       = i * H + 4;
        const isBest  = i === 0;
        const fill    = isBest ? color : OTHER_COLOR;
        const profitVsModal = modal > 0 ? Math.round(((val - modal) / modal) * 100) : 0;
        const profitVsBest  = bestNet > 0 ? Math.round(((val - bestNet) / bestNet) * 100) : 0;

        return (
          <g key={d.name || i}>
            {/* Market label */}
            <text x={LW - 8} y={y + H / 2 + 5} textAnchor="end" fontSize="11"
              fill={isBest ? BEST_COLOR : "#6b7e76"} fontWeight={isBest ? "700" : "400"}>
              {shortName(d.name)}
            </text>

            {/* Bar track */}
            <rect x={LW} y={y + 8} width={W} height={H - 16} rx="4" fill="#f0ede4" />

            {/* Net realization bar */}
            <rect x={LW} y={y + 8} width={Math.max(barW, 2)} height={H - 16} rx="4" fill={fill} opacity="0.9" />

            {/* Modal price tick on this market's bar */}
            <line
              x1={LW + toX(modal)} x2={LW + toX(modal)}
              y1={y + 6} y2={y + H - 6}
              stroke="#fff" strokeWidth="2" opacity="0.6"
            />

            {/* Value label */}
            <text x={LW + barW + 6} y={y + H / 2 + 5} fontSize="11"
              fill={isBest ? BEST_COLOR : "#6b7e76"} fontWeight={isBest ? "700" : "500"}>
              {fmt(val)}
            </text>

            {/* vs best market delta */}
            {!isBest && (
              <text x={LW + W + 10} y={y + H / 2 + 5} fontSize="10"
                fill={profitVsBest >= 0 ? PROFIT_COLOR : COST_COLOR} fontWeight="700">
                {profitVsBest >= 0 ? "+" : ""}{profitVsBest}%
              </text>
            )}
            {isBest && (
              <text x={LW + W + 10} y={y + H / 2 + 5} fontSize="10"
                fill={BEST_COLOR} fontWeight="700">
                ★ Best
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Forecast line chart (unchanged) ─── */
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
      <polyline points={pts} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {days.map((d, i) => (
        <g key={d}>
          <circle cx={toX(i)} cy={toY(vals[i])} r="4" fill={lineColor} />
          <circle cx={toX(i)} cy={toY(vals[i])} r="2" fill="#fff" />
          <text x={toX(i)} y={PAD + iH + 16} textAnchor="middle" fontSize="10" fill="#888">{dayLabel(d)}</text>
          <text x={toX(i)} y={toY(vals[i]) - 10} textAnchor="middle" fontSize="10" fill={lineColor} fontWeight="600">
            {fmt(vals[i])}
          </text>
        </g>
      ))}
      <text x={PAD + iW} y={PAD - 6} textAnchor="end" fontSize="11" fill={lineColor} fontWeight="700">
        {rising ? "↑ Price rising" : "↓ Price falling"}
      </text>
    </svg>
  );
}
