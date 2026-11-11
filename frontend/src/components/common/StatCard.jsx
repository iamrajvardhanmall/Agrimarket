import { memo } from "react";

export const StatCard = memo(function StatCard({ label, value, sub, up }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {sub && (
        <small className={`stat-sub ${up === true ? "positive" : up === false ? "negative" : ""}`}>
          {sub}
        </small>
      )}
    </div>
  );
});

