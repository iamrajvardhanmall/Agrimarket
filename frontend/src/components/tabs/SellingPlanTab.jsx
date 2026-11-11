import React from "react";
import { IconSeed, IconPin, IconArrow, IconWhatsApp, IconStar, IconWarn, IconLeaf } from "../common/Icons";
import { ConfBar } from "../common/ConfBar";
import { fmt, today } from "../../utils/formatters";
import { shareWhatsApp } from "../../utils/share";
import { commodities, varieties, demoMarkets } from "../../constants/marketData";

export function SellingPlanTab({
  t, markets, recommendation, decisionOptions, ranking, forecast, forecastLoading,
  quantity, setQuantity, quality, setQuality,
  state, setState, district, setDistrict,
  commodity, setCommodity, commodityGroup, setCommodityGroup,
  variety, setVariety, transportRate, setTransportRate,
  storageDays, setStorageDays, storageRate, setStorageRate,
  deliveryPref, setDeliveryPref,
  runRecommendation, loading, isRecommendationPending,
  availableStates, availableDistricts, dataError, lang,
}) {
  const best = markets[0] || demoMarkets[0];
  const recommended = decisionOptions.find((o) => o.type === recommendation?.type) || decisionOptions[0];
  const net = recommended?.net_realization ?? best?.net_realization ?? 0;
  const conf = recommendation?.confidence ?? best?.confidence ?? 0;
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
          {best?.demand   ? <span className={`demand-pill demand-${(best.demand || "").toLowerCase()}`}>{best.demand}</span> : null}
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
            {decisionOptions.map((opt) => (
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
            <select value={commodity} onChange={(e) => { setCommodity(e.target.value); setCommodityGroup(""); }}>
              <option value="">{t.allCrops}</option>
              {commodities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="field">
            <span>{t.qty}</span>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </label>
          <label className="field">
            <span>{t.quality}</span>
            <select value={quality} onChange={(e) => setQuality(e.target.value)}>
              <option>{t.gradeA}</option><option>{t.gradeB}</option><option>{t.mixed}</option>
            </select>
          </label>
          <label className="field">
            <span>{t.state}</span>
            <select value={state} onChange={(e) => { setState(e.target.value); setDistrict(""); }}>
              <option value="">{t.allStates}</option>
              {availableStates.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="field">
            <span>{t.district}</span>
            <select value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!state}>
              <option value="">{state ? t.allDistricts : "Select state first"}</option>
              {availableDistricts.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <label className="field">
            <span>{t.variety}</span>
            <select value={variety} onChange={(e) => setVariety(e.target.value)}>
              <option value="">{t.allVarieties}</option>
              {varieties.map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label className="field">
            <span>{t.transport}</span>
            <input type="number" min="0" step="0.5" value={transportRate} onChange={(e) => setTransportRate(e.target.value)} />
          </label>
          <label className="field">
            <span>{t.storageDays}</span>
            <input type="number" min="0" value={storageDays} onChange={(e) => setStorageDays(e.target.value)} />
          </label>
          <label className="field">
            <span>{t.storageRate}</span>
            <input type="number" min="0" step="0.5" value={storageRate} onChange={(e) => setStorageRate(e.target.value)} />
          </label>
          <label className="field">
            <span>{t.deliveryPref}</span>
            <select value={deliveryPref} onChange={(e) => setDeliveryPref(e.target.value)}>
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

