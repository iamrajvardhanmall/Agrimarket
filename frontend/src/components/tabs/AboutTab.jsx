import React from "react";

export function AboutTab({ t, onGoToPlan, onGoToMarkets }) {
  const isHi = t.appName === "एग्रीमार्केट";
  return (
    <div className="tab-content about-page">
      {/* ── Hero ── */}
      <div className="hero-card about-hero">
        <div className="hero-badge">🌱 {isHi ? "किसान-प्रथम कृषि निर्णय मंच" : "Farmer-First Decision Platform"}</div>
        <h1 className="hero-title" style={{ fontSize: "28px", lineHeight: "1.3" }}>
          {isHi ? "स्मार्ट बेचें। ज़्यादा कमाएं।" : "Sell Smarter. Earn More."}
        </h1>
        <p style={{ opacity: 0.9, fontSize: "16px", maxWidth: "680px", marginBottom: "20px", lineHeight: "1.6" }}>
          {isHi
            ? "एग्रीमार्केट एआई किसानों को देश भर की मंडियों के सटीक भाव, 7-दिवसीय एआई मूल्य पूर्वानुमान और परिवहन-भंडारण खर्च घटाकर आपका शुद्ध वास्तविक मुनाफा बताता है।"
            : "AgriMarket AI helps farmers make confident selling decisions by analyzing real-time mandi prices, projecting 7-day ML price forecasts, and calculating true net profits after transport and storage costs."}
        </p>

        <div className="hero-actions" style={{ gap: "12px", marginTop: "10px" }}>
          <button className="btn-primary" onClick={onGoToPlan} style={{ fontSize: "15px", padding: "14px 24px" }}>
            🌾 {isHi ? "अपनी बिक्री योजना बनाएं" : "Calculate Selling Plan"} →
          </button>
          <button
            className="btn-secondary"
            onClick={onGoToMarkets}
            style={{ background: "rgba(255,255,255,0.18)", color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}
          >
            📊 {isHi ? "मंडी भाव देखें" : "Explore Mandi Prices"}
          </button>
        </div>

        {/* Quick Highlights bar */}
        <div className="about-stats-strip">
          <div className="stat-pill">
            <strong>10,000+</strong>
            <span>{isHi ? "मंडी रिकॉर्ड" : "Mandi Records"}</span>
          </div>
          <div className="stat-pill">
            <strong>7-Day</strong>
            <span>{isHi ? "एमएल पूर्वानुमान" : "ML Forecasts"}</span>
          </div>
          <div className="stat-pill">
            <strong>₹0 / Free</strong>
            <span>{isHi ? "बिना लॉगिन तुरंत" : "No Login Needed"}</span>
          </div>
          <div className="stat-pill">
            <strong>EN + हिंदी</strong>
            <span>{isHi ? "दोभाषी सहायता" : "Bilingual"}</span>
          </div>
        </div>
      </div>

      {/* ── The Problem & The Solution ── */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: "16px" }}>
          💡 {isHi ? "एग्रीमार्केट एआई क्यों आवश्यक है?" : "Why AgriMarket AI?"}
        </h2>
        <div className="about-compare-grid">
          <div className="compare-card bad">
            <div className="compare-tag bad-tag">❌ {isHi ? "पारंपरिक तरीका" : "The Traditional Struggle"}</div>
            <h4>{isHi ? "अधूरे भावों पर निर्णय" : "Misleading Gross Prices"}</h4>
            <p>
              {isHi
                ? "दूर की मंडी में ₹200 ज़्यादा दिखते हैं, लेकिन डीजल, लोडिंग और समय के नुकसान के बाद अक्सर किसान घाटे में रहता है।"
                : "A mandi 60 km away may advertise ₹200/quintal more, but after paying high transport and transit losses, take-home profit is often lower."}
            </p>
          </div>
          <div className="compare-card good">
            <div className="compare-tag good-tag">✅ {isHi ? "एग्रीमार्केट का समाधान" : "The AgriMarket Advantage"}</div>
            <h4>{isHi ? "शुद्ध वास्तविक मुनाफा" : "True Net Realization"}</h4>
            <p>
              {isHi
                ? "हम आपके वास्तविक परिवहन (₹/क्विंटल/किमी) और भंडारण खर्च को घटाकर बताते हैं कि आज कहाँ बेचना सबसे अधिक लाभदायक है।"
                : "We subtract actual transit distance costs and storage holding rates to rank mandis by net profit in your pocket, with 'Sell Now vs. Store' advice."}
            </p>
          </div>
        </div>
      </div>

      {/* ── 3-Step Journey ── */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: "20px" }}>
          🚜 {isHi ? "यह कैसे काम करता है? (3 आसान चरण)" : "How It Works (3 Simple Steps)"}
        </h2>
        <div className="about-steps-grid">
          <div className="about-step-item">
            <div className="step-num">1</div>
            <div className="step-icon">🌾</div>
            <h3>{isHi ? "अपनी फसल चुनें" : "Select Produce"}</h3>
            <p>
              {isHi
                ? "अपनी फसल (टमाटर, प्याज, गेहूं आदि), राज्य, जिला और फसल की मात्रा दर्ज करें।"
                : "Choose your crop, your home district, and total harvest quantity."}
            </p>
          </div>
          <div className="about-step-item">
            <div className="step-num">2</div>
            <div className="step-icon">🤖</div>
            <h3>{isHi ? "एआई तुलना करता है" : "AI Analyzes Costs"}</h3>
            <p>
              {isHi
                ? "मशीन लर्निंग मॉडल आसपास की मंडियों, दूरी और भंडारण खर्च का सटीक आकलन करता है।"
                : "Our ML engine compares nearby mandis, transit kilometers, and holding costs."}
            </p>
          </div>
          <div className="about-step-item">
            <div className="step-num">3</div>
            <div className="step-icon">💰</div>
            <h3>{isHi ? "अधिकतम लाभ कमाएं" : "Maximize Earnings"}</h3>
            <p>
              {isHi
                ? "सर्वश्रेष्ठ मंडी की अनुशंसा और 7-दिवसीय मूल्य रुझान के साथ सही समय पर बेचें।"
                : "Receive rank-ordered recommendations with expected take-home income and confidence."}
            </p>
          </div>
        </div>
      </div>

      {/* ── Feature Highlights ── */}
      <div className="about-features-grid">
        <div className="feature-card">
          <div className="feature-icon">📈</div>
          <h3>{isHi ? "7-दिवसीय मूल्य पूर्वानुमान" : "7-Day ML Price Forecasting"}</h3>
          <p>
            {isHi
              ? "ऐतिहासिक मंडी आवक पर प्रशिक्षित लीनियर रिग्रेशन और डिसीजन ट्री मॉडल अगले सप्ताह के भाव का पूर्वानुमान लगाते हैं।"
              : "Time-series regression models trained on multi-year mandi records project expected modal price movements."}
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🚚</div>
          <h3>{isHi ? "सटीक परिवहन लागत" : "Custom Transport Economics"}</h3>
          <p>
            {isHi
              ? "प्रति क्विंटल प्रति किलोमीटर परिवहन खर्च को जोड़कर वास्तविक मुनाफा निकालें।"
              : "Configure your local ₹/qtl/km transit and ₹/kg/day storage rates for pinpoint net profitability."}
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>{isHi ? "6-स्तरीय विस्तृत मंडी फ़िल्टर" : "6-Level Cascading Mandi Explorer"}</h3>
          <p>
            {isHi
              ? "फसल वर्ग, वस्तु, किस्म, राज्य, जिला और मंडी के आधार पर तुरंत सटीक भाव और आवक मात्रा देखें।"
              : "Explore mandi prices by commodity group, crop, variety, state, district, and specific APMC market."}
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3>{isHi ? "ऑफलाइन सुरक्षित तकनीक" : "Zero-Crash Reliability"}</h3>
          <p>
            {isHi
              ? "सरकारी सर्वर धीमे होने पर भी अंतर्निहित डेटासेट से निरंतर और त्वरित सेवाएं।"
              : "Built with graceful hierarchical CSV fallbacks so the app never crashes even during upstream API outages."}
          </p>
        </div>
      </div>

      {/* ── Mission & Open Data Notice ── */}
      <div className="card" style={{ background: "linear-gradient(135deg, #10523f 0%, #186b50 100%)", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.8 }}>
              {isHi ? "हमारा संकल्प" : "Our Mission"}
            </span>
            <h3 style={{ fontSize: "20px", marginTop: "4px", marginBottom: "8px" }}>
              {isHi ? "भारतीय किसानों के लिए पारदर्शी और सुलभ तकनीक" : "Bridging Information Asymmetry for Every Indian Farmer"}
            </h3>
            <p style={{ opacity: 0.85, fontSize: "14px", maxWidth: "600px", lineHeight: "1.5" }}>
              {isHi
                ? "ओपन गवर्नमेंट डेटा (data.gov.in / AGMARKNET) के आधिकारिक मंडी आंकड़ों पर आधारित। 100% निशुल्क और सभी किसानों के लिए सहज।"
                : "Powered by authentic Open Government Data (data.gov.in / AGMARKNET). Completely free, open to all, with no passwords or account barriers."}
            </p>
          </div>
          <button className="btn-primary" onClick={onGoToPlan} style={{ minWidth: "180px", justifyContent: "center" }}>
            🌾 {isHi ? "शुरू करें →" : "Get Started →"}
          </button>
        </div>
      </div>
    </div>
  );
}

