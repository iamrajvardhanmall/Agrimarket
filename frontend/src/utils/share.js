import { fmt } from "./formatters";

const APP_URL = "https://agrimarket-gold.vercel.app";

export function shareWhatsApp(t, market, net, lang) {
  const msg =
    lang === "hi"
      ? `🌾 AgriMarket सलाह: ${market} पर अभी बेचें — ₹${Math.round(net).toLocaleString("en-IN")} मिलेंगे!\n${APP_URL}`
      : `🌾 AgriMarket tip: Sell at ${market} now — you'll earn ${fmt(net)}!\n${APP_URL}`;
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
}
