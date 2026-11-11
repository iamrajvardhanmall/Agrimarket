import { fmt, fmtNum } from "../../utils/formatters";

/** Horizontal bar chart – one coloured bar per market */
export function HBarChart({ data, valueKey, label, color = "#186b50", fmt: fmtFn = fmt }) {
  if (!data.length) return null;
  const vals   = data.map((d) => Number(d[valueKey]) || 0);
  const maxVal = Math.max(...vals, 1);
  const H      = 36;          // row height
  const LW     = 130;         // label column width
  const W      = 480;         // bar area width
  const height = data.length * H + 10;
  return (
    <svg viewBox={`0 0 ${LW + W + 60} ${height}`} className="svg-chart" aria-label={label}>
      {data.map((d, i) => {
        const val    = Number(d[valueKey]) || 0;
        const barW   = (val / maxVal) * W;
        const y      = i * H + 4;
        const isBest = i === 0;
        const fill   = isBest ? color : "#a8d4bd";
        return (
          <g key={d.name || i}>
            <text x={LW - 6} y={y + H / 2 + 5} textAnchor="end" fontSize="11" fill="#6b7e76" className="chart-label">
              {(d.name || "").replace(" APMC", "").replace(" Market", "")}
            </text>
            <rect x={LW} y={y + 4} width={W} height={H - 10} rx="4" fill="#f0ede4" />
            <rect x={LW} y={y + 4} width={Math.max(barW, 2)} height={H - 10} rx="4" fill={fill} />
            <text x={LW + barW + 6} y={y + H / 2 + 5} fontSize="11" fill={isBest ? color : "#6b7e76"} fontWeight={isBest ? "700" : "400"}>
              {fmtFn(val)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Price range chart — min / modal / max shown as a horizontal range bar */
export function PriceRangeChart({ data }) {
  if (!data.length) return null;
  const allPrices = data.flatMap((d) => [d.min_price, d.price, d.max_price].map(Number).filter(Boolean));
  const minAll = Math.min(...allPrices);
  const maxAll = Math.max(...allPrices, minAll + 1);
  const H  = 40;
  const LW = 130;
  const W  = 400;
  const height = data.length * H + 20;
  const toX = (v) => LW + ((Number(v) - minAll) / (maxAll - minAll)) * W;

  return (
    <svg viewBox={`0 0 ${LW + W + 80} ${height}`} className="svg-chart" aria-label="Price range per market">
      <text x={LW} y={height - 2} fontSize="10" fill="#aaa">{fmt(minAll)}</text>
      <text x={LW + W} y={height - 2} fontSize="10" fill="#aaa" textAnchor="end">{fmt(maxAll)}</text>

      {data.map((d, i) => {
        const y     = i * H + 6;
        const xMin  = toX(d.min_price || d.price);
        const xMid  = toX(d.price);
        const xMax  = toX(d.max_price || d.price);
        const isBest = i === 0;
        return (
          <g key={d.name || i}>
            <text x={LW - 6} y={y + H / 2 + 4} textAnchor="end" fontSize="11" fill="#6b7e76">
              {(d.name || "").replace(" APMC", "").replace(" Market", "")}
            </text>
            <line x1={xMin} x2={xMax} y1={y + H / 2} y2={y + H / 2} stroke="#c5ddd1" strokeWidth="6" strokeLinecap="round" />
            <circle cx={xMid} cy={y + H / 2} r="7" fill={isBest ? "#186b50" : "#6cb290"} />
            <circle cx={xMid} cy={y + H / 2} r="3" fill="#fff" />
            <line x1={xMin} x2={xMin} y1={y + H / 2 - 5} y2={y + H / 2 + 5} stroke="#b0cfc0" strokeWidth="2" />
            <line x1={xMax} x2={xMax} y1={y + H / 2 - 5} y2={y + H / 2 + 5} stroke="#b0cfc0" strokeWidth="2" />
            <text x={xMid} y={y + 10} textAnchor="middle" fontSize="10" fill={isBest ? "#186b50" : "#888"} fontWeight={isBest ? "700" : "400"}>
              {fmt(d.price)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Multi-line SVG chart for 7-day forecast */
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
  const areaColor = rising ? "#186b50" : "#c0392b";

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
      <path d={areaD} fill={areaColor} opacity="0.08" />
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

/** Grouped bar chart: modal price vs net realization per market */
export function PriceVsNetChart({ data }) {
  if (!data.length) return null;
  const prices = data.map((d) => Number(d.price) || 0);
  const nets   = data.map((d) => Number(d.net_realization) || 0);
  const maxVal = Math.max(...prices, ...nets, 1);
  const BW     = 22;   // bar width
  const GAP    = 6;    // gap between pair
  const GRP    = 60;   // group width
  const PAD    = 48;
  const H      = 180;
  const iH     = H - PAD - 20;
  const W      = data.length * GRP + PAD * 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="svg-chart" aria-label="Price vs net realization">
      {[0.25, 0.5, 0.75, 1].map((f) => {
        const y = PAD + iH * (1 - f);
        const v = maxVal * f;
        return (
          <g key={f}>
            <line x1={PAD} x2={W - PAD + 20} y1={y} y2={y} stroke="#e8e4da" strokeWidth="1" />
            <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#aaa">{fmt(v)}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const cx     = PAD + i * GRP + GRP / 2;
        const ph     = (prices[i] / maxVal) * iH;
        const nh     = (nets[i]   / maxVal) * iH;
        const pY     = PAD + iH - ph;
        const nY     = PAD + iH - nh;
        const label  = (d.name || "").replace(" APMC", "").replace(" Market", "").split(" ")[0];
        return (
          <g key={d.name || i}>
            <rect x={cx - BW - GAP / 2} y={pY} width={BW} height={ph} rx="3" fill="#6cb290" />
            <rect x={cx + GAP / 2}       y={nY} width={BW} height={nh} rx="3" fill="#186b50" />
            <text x={cx} y={PAD + iH + 14} textAnchor="middle" fontSize="10" fill="#6b7e76">{label}</text>
          </g>
        );
      })}
      <rect x={PAD} y={6} width="10" height="10" rx="2" fill="#6cb290" />
      <text x={PAD + 14} y={15} fontSize="10" fill="#6b7e76">Modal price</text>
      <rect x={PAD + 90} y={6} width="10" height="10" rx="2" fill="#186b50" />
      <text x={PAD + 104} y={15} fontSize="10" fill="#6b7e76">You'll earn</text>
    </svg>
  );
}

/** Arrival volume donut / bubble chart */
export function ArrivalBubbleChart({ data }) {
  if (!data.length) return null;
  const vals  = data.map((d) => Number(d.arrival_quantity ?? d.arrival) || 0);
  const total = vals.reduce((a, b) => a + b, 0) || 1;
  const maxV  = Math.max(...vals, 1);
  const W = 500; const CY = 80; const R_MAX = 50;
  const colors = ["#186b50", "#6cb290", "#a8d4bd", "#c5ddd1", "#e6f2ec"];
  const cx = (i) => 60 + i * (W / data.length);

  return (
    <svg viewBox={`0 0 ${W} ${CY * 2 + 20}`} className="svg-chart" aria-label="Market arrival volume">
      {data.map((d, i) => {
        const v   = vals[i];
        const r   = Math.max(10, (v / maxV) * R_MAX);
        const pct = total > 0 ? Math.round((v / total) * 100) : 0;
        return (
          <g key={d.name || i}>
            <circle cx={cx(i)} cy={CY} r={r} fill={colors[i % colors.length]} opacity="0.85" />
            <text x={cx(i)} y={CY + 4} textAnchor="middle" fontSize="11" fill="#fff" fontWeight="700">
              {pct}%
            </text>
            <text x={cx(i)} y={CY + r + 14} textAnchor="middle" fontSize="10" fill="#6b7e76">
              {(d.name || "").replace(" APMC", "").replace(" Market", "").split(" ")[0]}
            </text>
            <text x={cx(i)} y={CY + r + 26} textAnchor="middle" fontSize="9" fill="#aaa">
              {fmtNum(v)} kg
            </text>
          </g>
        );
      })}
    </svg>
  );
}

