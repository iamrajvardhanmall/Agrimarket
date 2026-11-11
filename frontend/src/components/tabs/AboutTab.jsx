import React from "react";

export function AboutTab({ t, onGoToPlan, onGoToMarkets }) {
  const isHi = t.appName === "एग्रीमार्केट";

  return (
    <div className="about-page">

      {/* ══ HERO ══ */}
      <section className="ab-hero">
        <div className="ab-hero-content">
          <div className="ab-live-pill">
            <span className="ab-live-dot" />
            {isHi ? "लाइव मंडी डेटा" : "Live Mandi Data"}
          </div>

          <h1 className="ab-h1">
            {isHi ? "सही मंडी। सही दाम।" : "Right Market. Right Price."}
            <br />
            <span className="ab-h1-gold">
              {isHi ? "हर बार।" : "Every Time."}
            </span>
          </h1>

          <p className="ab-hero-desc">
            {isHi
              ? "फसल का सही दाम पाना अब आसान है। अपनी फसल चुनें, जिला चुनें — हम बताएंगे कहाँ बेचने पर सबसे ज़्यादा पैसे मिलेंगे।"
              : "Know exactly which mandi gives you the most money after transport and storage. Free, no login, works on any phone."}
          </p>

          <div className="ab-hero-btns">
            <button className="ab-btn-gold" onClick={onGoToPlan}>
              🌾 {isHi ? "मेरी बिक्री योजना बनाएं" : "Calculate My Plan"}
            </button>
            <button className="ab-btn-outline" onClick={onGoToMarkets}>
              📊 {isHi ? "मंडी भाव देखें" : "See Mandi Prices"}
            </button>
          </div>
        </div>

        {/* Quick trust row */}
        <div className="ab-trust-row">
          {[
            { e: "✅", text: isHi ? "बिल्कुल मुफ़्त" : "100% Free" },
            { e: "🔓", text: isHi ? "बिना लॉगिन" : "No Login" },
            { e: "📱", text: isHi ? "हर फोन पर" : "Any Phone" },
            { e: "🇮🇳", text: isHi ? "भारत के लिए" : "Made for India" },
          ].map((item) => (
            <div key={item.text} className="ab-trust-pill">
              {item.e} {item.text}
            </div>
          ))}
        </div>
      </section>

      {/* ══ STAT CARDS ══ */}
      <section className="ab-stats-section">
        {[
          { val: "10,000+", label: isHi ? "मंडी रिकॉर्ड" : "Mandi Records", icon: "📋" },
          { val: "7", label: isHi ? "दिन का पूर्वानुमान" : "Day Forecast", icon: "🔮" },
          { val: "₹0", label: isHi ? "कोई शुल्क नहीं" : "Zero Cost", icon: "🎁" },
          { val: "2", label: isHi ? "भाषाएं" : "Languages", icon: "🗣️" },
        ].map((s) => (
          <div key={s.label} className="ab-stat-card">
            <div className="ab-stat-icon">{s.icon}</div>
            <div className="ab-stat-val">{s.val}</div>
            <div className="ab-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ══ HOW IT WORKS — 3 big visual steps ══ */}
      <section className="ab-section ab-section-green">
        <div className="ab-section-tag">
          {isHi ? "यह कैसे काम करता है?" : "How It Works"}
        </div>
        <h2 className="ab-section-h2">
          {isHi ? "3 आसान कदम" : "3 Simple Steps"}
        </h2>

        <div className="ab-steps-row">
          {[
            {
              n: "1",
              icon: "🌾",
              col: "#e8f5ec",
              border: "#bde0c8",
              title: isHi ? "अपनी फसल चुनें" : "Pick Your Crop",
              body: isHi
                ? "फसल, जिला और मात्रा भरें — 30 सेकंड में"
                : "Select crop, district & quantity — takes 30 sec",
            },
            {
              n: "2",
              icon: "🤖",
              col: "#fef9ec",
              border: "#f5dfa0",
              title: isHi ? "AI विश्लेषण करता है" : "AI Analyses",
              body: isHi
                ? "हमारा AI पास की सभी मंडियों की तुलना करता है"
                : "Our AI compares all nearby mandis instantly",
            },
            {
              n: "3",
              icon: "💰",
              col: "#e8f5ec",
              border: "#bde0c8",
              title: isHi ? "सर्वोत्तम मंडी चुनें" : "Pick Best Market",
              body: isHi
                ? "जेब में आने वाला असली पैसा — परिवहन खर्च के बाद"
                : "See exact money in hand after all transport costs",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="ab-step-card"
              style={{ background: s.col, borderColor: s.border }}
            >
              <div className="ab-step-num">{s.n}</div>
              <div className="ab-step-emoji">{s.icon}</div>
              <h3 className="ab-step-title">{s.title}</h3>
              <p className="ab-step-body">{s.body}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "28px" }}>
          <button className="ab-btn-gold" onClick={onGoToPlan}>
            {isHi ? "अभी शुरू करें →" : "Try It Now →"}
          </button>
        </div>
      </section>

      {/* ══ WHAT YOU GET — benefit cards ══ */}
      <section className="ab-section ab-section-white">
        <div className="ab-section-tag">
          {isHi ? "क्या मिलेगा?" : "What You Get"}
        </div>
        <h2 className="ab-section-h2">
          {isHi ? "आपको क्या फायदा होगा" : "Your Benefits at a Glance"}
        </h2>

        <div className="ab-benefit-grid">
          {[
            {
              icon: "💸",
              title: isHi ? "असली मुनाफा" : "Real Net Profit",
              body: isHi
                ? "परिवहन और भंडारण के खर्च काटकर हाथ में आने वाला पैसा बताता है — सिर्फ मंडी का भाव नहीं।"
                : "Shows money in hand after deducting transport & storage — not just the mandi rate.",
              accent: "#186b50",
              bg: "#e8f5ec",
            },
            {
              icon: "📅",
              title: isHi ? "7 दिन का भविष्य" : "7-Day Price Outlook",
              body: isHi
                ? "AI बताता है अगले हफ्ते भाव बढ़ेंगे या घटेंगे — सही समय पर बेचें।"
                : "AI predicts whether prices will rise or fall next week so you sell at the peak.",
              accent: "#b45309",
              bg: "#fef9ec",
            },
            {
              icon: "🏪",
              title: isHi ? "नज़दीकी मंडियां" : "Nearby Mandis Ranked",
              body: isHi
                ? "आपके जिले की सभी मंडियों को मुनाफे के हिसाब से क्रमबद्ध किया जाता है।"
                : "Every APMC market near you ranked by expected net earnings, not just price.",
              accent: "#7c3aed",
              bg: "#f5f0fe",
            },
            {
              icon: "⏰",
              title: isHi ? "अभी बेचें या रुकें?" : "Sell Now or Wait?",
              body: isHi
                ? "अभी बेचें / बाद में बेचें / दूसरी मंडी — तीनों विकल्पों की तुलना एक जगह।"
                : "Instant Sell Now vs Store & Sell Later vs Alternate Market comparison.",
              accent: "#186b50",
              bg: "#e8f5ec",
            },
          ].map((b) => (
            <div key={b.title} className="ab-benefit-card" style={{ background: b.bg }}>
              <div className="ab-benefit-icon" style={{ color: b.accent }}>
                {b.icon}
              </div>
              <h3 className="ab-benefit-title" style={{ color: b.accent }}>
                {b.title}
              </h3>
              <p className="ab-benefit-body">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ BEFORE / AFTER comparison ══ */}
      <section className="ab-section ab-section-cream">
        <div className="ab-section-tag">
          {isHi ? "पहले और बाद में" : "Before vs After"}
        </div>
        <h2 className="ab-section-h2">
          {isHi ? "AgriMarket AI से फर्क" : "The AgriMarket Difference"}
        </h2>

        <div className="ab-compare">
          <div className="ab-compare-col ab-compare-bad">
            <div className="ab-compare-head">
              ❌ {isHi ? "पहले" : "Before"}
            </div>
            {[
              isHi ? "दलाल के भाव पर भरोसा" : "Rely on middlemen's prices",
              isHi ? "डीजल खर्च का अंदाजा नहीं" : "No idea of transport costs",
              isHi ? "कल के अखबार का भाव" : "Yesterday's newspaper rate",
              isHi ? "सिर्फ एक मंडी की जानकारी" : "Only one mandi's info",
            ].map((item) => (
              <div key={item} className="ab-compare-item">
                <span className="ab-compare-x">✗</span> {item}
              </div>
            ))}
          </div>

          <div className="ab-compare-divider">
            <div className="ab-compare-vs">VS</div>
          </div>

          <div className="ab-compare-col ab-compare-good">
            <div className="ab-compare-head">
              ✅ {isHi ? "AgriMarket AI के साथ" : "With AgriMarket AI"}
            </div>
            {[
              isHi ? "सरकारी डेटा से सटीक भाव" : "Official govt. prices (AGMARKNET)",
              isHi ? "परिवहन खर्च स्वचालित" : "Transport cost auto-calculated",
              isHi ? "आज का लाइव डेटा" : "Today's live data, every 12 hours",
              isHi ? "सभी नज़दीकी मंडियां" : "All nearby mandis compared",
            ].map((item) => (
              <div key={item} className="ab-compare-item">
                <span className="ab-compare-tick">✓</span> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DATA SOURCE TRUST ══ */}
      <section className="ab-trust-section">
        <div className="ab-trust-inner">
          <div className="ab-trust-icon">🏛️</div>
          <div>
            <h3>{isHi ? "सरकारी डेटा। 100% भरोसेमंद।" : "Official Government Data. 100% Trustworthy."}</h3>
            <p>
              {isHi
                ? "सभी मंडी भाव data.gov.in (AGMARKNET) से लिए जाते हैं — यही डेटा सरकार उपयोग करती है।"
                : "All prices sourced from data.gov.in (AGMARKNET) — the same data the government uses. No middlemen, no manipulation."}
            </p>
            <div className="ab-trust-tags">
              {["🏛️ data.gov.in", "📜 AGMARKNET", "🤖 scikit-learn AI", "🔓 Open Source"].map((tag) => (
                <span key={tag} className="ab-trust-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="ab-cta">
        <div className="ab-cta-emoji">🌾</div>
        <h2>{isHi ? "आज ही शुरू करें" : "Start Right Now"}</h2>
        <p>
          {isHi
            ? "30 सेकंड में — कोई रजिस्ट्रेशन नहीं, कोई पासवर्ड नहीं, बिल्कुल मुफ़्त"
            : "30 seconds — no registration, no password, completely free"}
        </p>
        <button className="ab-btn-gold ab-cta-btn" onClick={onGoToPlan}>
          {isHi ? "मेरी बिक्री योजना बनाएं →" : "Get My Free Selling Plan →"}
        </button>
        <div className="ab-cta-pills">
          <span>🔒 {isHi ? "बिना लॉगिन" : "No login"}</span>
          <span>📱 {isHi ? "मोबाइल फ्रेंडली" : "Mobile friendly"}</span>
          <span>⚡ {isHi ? "तुरंत परिणाम" : "Instant results"}</span>
        </div>
      </section>

    </div>
  );
}
