import { clamp } from "../../utils/formatters";

export function ConfBar({ pct: p }) {
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

