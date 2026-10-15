import { fetch } from "sdk";
import { SITE_URL } from "./config.js";
import { history } from "./store.js";
export async function chartHistory(item, hours, now) {
  const range = hours <= 1 ? "1H" : hours <= 24 ? "1D" : "1W";
  try {
    const response = await fetch(
      `${SITE_URL}/api/history?symbol=${encodeURIComponent(item.symbol)}&range=${range}`,
    );
    if (!response.ok) throw new Error("History unavailable");
    const data = await response.json();
    if (
      data.source !== "tgju" ||
      data.symbol !== item.symbol ||
      !Array.isArray(data.points)
    )
      throw new Error("Invalid history");
    const unique = new Map();
    for (const p of data.points)
      if (
        Number.isFinite(p.at) &&
        p.at >= now - hours * 3600000 &&
        p.at <= now + 30000 &&
        Number.isFinite(p.price) &&
        p.price > 0
      )
        unique.set(p.at, { at: p.at, price: p.price });
    const points = [...unique.values()].sort((a, b) => a.at - b.at);
    if (points.length >= 2)
      return {
        points,
        source:
          data.resolution === "daily"
            ? "قیمت‌های پایانی روزانهٔ TGJU"
            : "تاریخچهٔ داخل روز TGJU",
      };
  } catch {
    /* A source outage must never become a made-up chart. */
  }
  return {
    points: await history(item.id, hours, now),
    source:
      "نمونه‌های واقعی ثبت‌شده توسط بات؛ تاریخچهٔ TGJU در این بازه موجود نبود",
  };
}
