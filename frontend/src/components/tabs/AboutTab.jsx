import React from "react";

const EN = {
  badge: "India's Open Mandi Intelligence Platform",
  h1a: "Sell at the Right Price.",
  h1b: "Every Season.",
  sub:
    "AgriMarket AI gives every Indian farmer real-time mandi data, 7-day ML price forecasts, and transparent net-profit calculations — completely free, no login required.",
  cta1: "Calculate My Selling Plan",
  cta2: "Explore Mandi Prices",
  stats: [
    { val: "1,00,000+", label: "Mandi Records" },
    { val: "7-Day", label: "ML Price Forecast" },
    { val: "Free", label: "No Hidden Cost" },
    { val: "EN + हिंदी", label: "Bilingual Support" },
  ],
  whyTitle: "The Problem We Solve",
  whySub:
    "Indian farmers lose an estimated ₹63,000 crore annually due to information asymmetry — not knowing which mandi will net the highest profit after real costs.",
  problems: [
    {
      icon: "📉",
      title: "Misleading Gross Prices",
      body:
        "A distant mandi offering ₹200/quintal more often costs more in diesel, loading & transit loss — farmers end up with less.",
    },
    {
      icon: "📵",
      title: "No Digital Access",
      body:
        "Most price-discovery tools require expensive smartphones, data plans, or logins that rural farmers simply don't have.",
    },
    {
      icon: "⏱️",
      title: "Stale Information",
      body:
        "Prices printed in newspapers or shared by middlemen are 1–2 days old — market conditions can shift overnight.",
    },
  ],
  howTitle: "How It Works",
  steps: [
    {
      n: "01",
      icon: "🌾",
      title: "Enter Your Details",
      body: "Select crop, home district, harvest quantity and quality grade. No registration needed.",
    },
    {
      n: "02",
      icon: "🤖",
      title: "AI Analyses Markets",
      body:
        "Our ML ensemble (Linear Regression + Decision Tree) scores every nearby mandi on predicted price, distance cost and storage rate.",
    },
    {
      n: "03",
      icon: "💰",
      title: "Receive Net-Profit Advice",
      body:
        "Get ranked Sell Now, Store & Sell Later, and Alternate Market options showing exact rupees in pocket — not just market rate.",
    },
  ],
  featTitle: "Platform Capabilities",
  features: [
    {
      icon: "📊",
      title: "Live Mandi Data",
      body: "Sourced from AGMARKNET / data.gov.in — official government prices refreshed every 12 hours automatically.",
    },
    {
      icon: "🔮",
      title: "7-Day Price Forecasting",
      body:
        "Time-series regression trained on historical arrivals surfaces rising or falling trends so you pick the optimal sell window.",
    },
    {
      icon: "🚚",
      title: "True Net Realisation",
      body:
        "Deducts your exact transport (₹/qtl/km) and cold-storage (₹/kg/day) costs so comparisons are always apples-to-apples.",
    },
    {
      icon: "🔍",
      title: "6-Level Mandi Explorer",
      body:
        "Filter by commodity group → crop → variety → state → district → specific APMC market with instant results.",
    },
    {
      icon: "⚡",
      title: "Zero-Crash Reliability",
      body:
        "Built-in hierarchical CSV fallback means the app stays fully functional even during government API outages.",
    },
    {
      icon: "🌐",
      title: "Works Everywhere",
      body:
        "Lightweight Progressive Web App — opens instantly on any smartphone, feature phone browser or desktop with no install.",
    },
  ],
  techTitle: "Built on Open Data",
  techBody:
    "AgriMarket AI is powered entirely by Open Government Data published under the NLOGI licence on data.gov.in (AGMARKNET dataset). No proprietary data, no subscriptions, no paywalls.",
  techBadges: ["data.gov.in", "AGMARKNET", "scikit-learn ML", "Open Source"],
  missionTitle: "Our Mission",
  missionBody:
    "Bridge the information gap between Indian farmers and mandi markets. Every rupee of information asymmetry we eliminate goes straight into a farmer's pocket.",
  ctaTitle: "Ready to maximise your harvest income?",
  ctaSub: "Takes 30 seconds. No account needed.",
  ctaBtn: "Get My Free Selling Plan →",
};

const HI = {
  badge: "भारत का ओपन मंडी इंटेलिजेंस प्लेटफॉर्म",
  h1a: "सही दाम पर बेचें।",
  h1b: "हर फसल में।",
  sub:
    "एग्रीमार्केट एआई हर भारतीय किसान को रियल-टाइम मंडी डेटा, 7-दिवसीय एमएल मूल्य पूर्वानुमान और पारदर्शी शुद्ध मुनाफा गणना देता है — बिल्कुल निशुल्क, बिना लॉगिन।",
  cta1: "बिक्री योजना बनाएं",
  cta2: "मंडी भाव देखें",
  stats: [
    { val: "10,000+", label: "मंडी रिकॉर्ड" },
    { val: "7-दिन", label: "एमएल पूर्वानुमान" },
    { val: "हमेशा निःशुल्क", label: "कोई छिपा खर्च नहीं" },
    { val: "EN + हिंदी", label: "दोभाषी सहायता" },
  ],
  whyTitle: "समस्या जो हम हल करते हैं",
  whySub:
    "जानकारी की कमी के कारण भारतीय किसान हर साल अनुमानित ₹63,000 करोड़ गँवाते हैं — यह नहीं जान पाते कि वास्तविक खर्च के बाद कौन सी मंडी सबसे ज़्यादा मुनाफा देगी।",
  problems: [
    {
      icon: "📉",
      title: "भ्रामक सकल भाव",
      body: "दूर की मंडी ₹200/क्विंटल ज़्यादा दिखती है, लेकिन डीजल और पारगमन हानि के बाद अक्सर नुकसान होता है।",
    },
    {
      icon: "📵",
      title: "डिजिटल पहुँच का अभाव",
      body: "अधिकांश मूल्य-खोज उपकरणों के लिए महंगे स्मार्टफोन, डेटा प्लान या लॉगिन चाहिए।",
    },
    {
      icon: "⏱️",
      title: "पुरानी जानकारी",
      body: "अखबार या दलालों के भाव 1–2 दिन पुराने होते हैं — बाज़ार रातोंरात बदल सकता है।",
    },
  ],
  howTitle: "यह कैसे काम करता है",
  steps: [
    {
      n: "01",
      icon: "🌾",
      title: "अपना विवरण दर्ज करें",
      body: "फसल, गृह जिला, मात्रा और गुणवत्ता ग्रेड चुनें। कोई पंजीकरण नहीं।",
    },
    {
      n: "02",
      icon: "🤖",
      title: "एआई बाजारों का विश्लेषण करता है",
      body: "हमारा एमएल एन्सेम्बल पास की हर मंडी को अनुमानित भाव, दूरी और भंडारण दर पर स्कोर देता है।",
    },
    {
      n: "03",
      icon: "💰",
      title: "शुद्ध मुनाफे की सलाह पाएं",
      body: "अभी बेचें / बाद में बेचें / वैकल्पिक मंडी — सटीक रुपये जो आपकी जेब में आएंगे।",
    },
  ],
  featTitle: "प्लेटफॉर्म क्षमताएं",
  features: [
    {
      icon: "📊",
      title: "लाइव मंडी डेटा",
      body: "AGMARKNET / data.gov.in से — हर 12 घंटे में स्वचालित रूप से अपडेट।",
    },
    {
      icon: "🔮",
      title: "7-दिवसीय मूल्य पूर्वानुमान",
      body: "ऐतिहासिक आवक पर प्रशिक्षित टाइम-सीरीज़ रिग्रेशन सर्वोत्तम बिक्री विंडो सुझाता है।",
    },
    {
      icon: "🚚",
      title: "वास्तविक शुद्ध प्राप्ति",
      body: "सटीक परिवहन (₹/क्विंटल/किमी) और भंडारण (₹/किग्रा/दिन) खर्च घटाकर सही तुलना।",
    },
    {
      icon: "🔍",
      title: "6-स्तरीय मंडी एक्सप्लोरर",
      body: "वस्तु समूह → फसल → किस्म → राज्य → जिला → विशिष्ट APMC मंडी — त्वरित परिणाम।",
    },
    {
      icon: "⚡",
      title: "ज़ीरो-क्रैश विश्वसनीयता",
      body: "अंतर्निहित CSV फ़ॉलबैक — सरकारी API बंद रहने पर भी ऐप पूरी तरह काम करता है।",
    },
    {
      icon: "🌐",
      title: "हर जगह काम करता है",
      body: "हल्का PWA — किसी भी स्मार्टफोन, फीचर फोन ब्राउज़र या डेस्कटॉप पर बिना इंस्टॉल खुलता है।",
    },
  ],
  techTitle: "ओपन डेटा पर निर्मित",
  techBody:
    "एग्रीमार्केट एआई पूरी तरह data.gov.in पर NLOGI लाइसेंस के तहत प्रकाशित ओपन गवर्नमेंट डेटा (AGMARKNET) पर आधारित है। कोई मालिकाना डेटा नहीं, कोई सदस्यता नहीं।",
  techBadges: ["data.gov.in", "AGMARKNET", "scikit-learn ML", "ओपन सोर्स"],
  missionTitle: "हमारा संकल्प",
  missionBody:
    "भारतीय किसानों और मंडी बाजारों के बीच जानकारी की खाई को पाटना। जानकारी की असमानता का हर रुपया जो हम खत्म करते हैं, वह सीधे किसान की जेब में जाता है।",
  ctaTitle: "फसल की आमदनी अधिकतम करने के लिए तैयार हैं?",
  ctaSub: "30 सेकंड लगते हैं। कोई खाता नहीं चाहिए।",
  ctaBtn: "मेरी निःशुल्क बिक्री योजना →",
};

export function AboutTab({ t, onGoToPlan, onGoToMarkets }) {
  const isHi = t.appName !== "AgriMarket AI";
  const c = isHi ? HI : EN;

  return (
    <div className="about-page">

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <div className="about-hero-badge">
            <span className="badge-dot" />
            {c.badge}
          </div>

          <h1 className="about-hero-h1">
            <span className="h1-line1">{c.h1a}</span>
            <span className="h1-line2">{c.h1b}</span>
          </h1>

          <p className="about-hero-sub">{c.sub}</p>

          <div className="about-hero-actions">
            <button className="about-btn-primary" onClick={onGoToPlan}>
              🌾 {c.cta1}
            </button>
            <button className="about-btn-ghost" onClick={onGoToMarkets}>
              📊 {c.cta2}
            </button>
          </div>

          {/* Stats strip */}
          <div className="about-stats-bar">
            {c.stats.map((s) => (
              <div key={s.label} className="about-stat-block">
                <strong>{s.val}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY / PROBLEM ════════════════════════════════════════ */}
      <section className="about-section">
        <div className="about-section-header">
          <div className="section-label">The Challenge</div>
          <h2 className="section-title">{c.whyTitle}</h2>
          <p className="section-sub">{c.whySub}</p>
        </div>

        <div className="about-problem-grid">
          {c.problems.map((p) => (
            <div key={p.title} className="problem-card">
              <div className="problem-icon">{p.icon}</div>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════= */}
      <section className="about-section about-section-alt">
        <div className="about-section-header">
          <div className="section-label">Process</div>
          <h2 className="section-title">{c.howTitle}</h2>
        </div>

        <div className="about-steps">
          {c.steps.map((s, i) => (
            <div key={s.n} className="about-step">
              <div className="step-connector">
                <div className="step-circle">{s.n}</div>
                {i < c.steps.length - 1 && <div className="step-line" />}
              </div>
              <div className="step-body">
                <div className="step-emoji">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════ */}
      <section className="about-section">
        <div className="about-section-header">
          <div className="section-label">Capabilities</div>
          <h2 className="section-title">{c.featTitle}</h2>
        </div>

        <div className="about-feat-grid">
          {c.features.map((f) => (
            <div key={f.title} className="about-feat-card">
              <div className="feat-icon-wrap">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ OPEN DATA TRUST STRIP ════════════════════════════════ */}
      <section className="about-trust-strip">
        <div className="trust-left">
          <div className="section-label light">{c.techTitle}</div>
          <p className="trust-body">{c.techBody}</p>
          <div className="trust-badges">
            {c.techBadges.map((b) => (
              <span key={b} className="trust-badge">{b}</span>
            ))}
          </div>
        </div>
        <div className="trust-right">
          <div className="mission-pill">
            <div className="mission-icon">🎯</div>
            <div>
              <strong>{c.missionTitle}</strong>
              <p>{c.missionBody}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════════ */}
      <section className="about-cta-section">
        <h2>{c.ctaTitle}</h2>
        <p>{c.ctaSub}</p>
        <button className="about-btn-primary large" onClick={onGoToPlan}>
          {c.ctaBtn}
        </button>
        <div className="cta-trust-row">
          <span>🔒 No login</span>
          <span>📵 Works offline</span>
          <span>🇮🇳 Made for India</span>
          <span>✅ 100% Free</span>
        </div>
      </section>

    </div>
  );
}
