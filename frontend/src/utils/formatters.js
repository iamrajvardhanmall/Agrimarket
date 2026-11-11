export const fmt = (v) =>
  Number.isFinite(Number(v)) ? `₹${Math.round(Number(v)).toLocaleString("en-IN")}` : "—";

export const fmtNum = (v, s = "") =>
  v === undefined || v === null || Number(v) === 0
    ? "—"
    : `${Math.round(Number(v)).toLocaleString("en-IN")}${s}`;

export const today = () =>
  new Date().toLocaleDateString("en-IN", { dateStyle: "full" });

export const isMorning = () => new Date().getHours() < 12;

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const pct = (n) => `${n}%`;

