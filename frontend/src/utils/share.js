import { fmt } from "./formatters";

export function shareWhatsApp(t, market, net, lang) {
  const msg =
    lang === "hi"
      ? `🌾 AgriMarket सलाह: ${market} पर अभी बेचें — ₹${Math.round(net).toLocaleString("en-IN")} मिलेंगे!\nagrimarket.app`
      : `🌾 AgriMarket tip: Sell at ${market} now — you'll earn ${fmt(net)}!\nagrimarket.app`;
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
}

