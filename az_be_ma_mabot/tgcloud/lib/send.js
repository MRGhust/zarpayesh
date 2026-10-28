import { api, InputFile } from "sdk";
import { ASSETS, money, localTime, SITE_URL } from "./config.js";
import { chartHistory } from "./price-history.js";
import { chartPng } from "./chart.js";
export async function sendPrice(chat, item, options = {}, now = Date.now()) {
  const chart = options.chart
    ? await chartHistory(item, options.hours || 24, now)
    : { points: [], source: "" };
  const points = chart.points;
  let text = `${options.prefix || "💱 زرپایش"}\n${ASSETS[item.id]}: ${money(item.priceRial, chat.unit, item.id)}`;

  if (Number.isFinite(item.changePercent) && Number.isFinite(item.changeRial)) {
    const sign = item.changePercent > 0 ? "🟢 +" : item.changePercent < 0 ? "🔴 " : "⚪️ ";
    text += `\nتغییر روزانه: ${sign}${item.changePercent.toFixed(2)}% (${money(Math.abs(item.changeRial), chat.unit, item.id)})`;
  }
  if (
    Number.isFinite(item.lowRial) &&
    Number.isFinite(item.highRial) &&
    item.lowRial > 0 &&
    item.highRial >= item.lowRial
  ) {
    text += `\nبازهٔ روز: ${money(item.lowRial, chat.unit, item.id)} تا ${money(item.highRial, chat.unit, item.id)}`;
  }
  if (
    Number.isFinite(item.bubbleRial) &&
    item.bubbleRial > 0 &&
    Number.isFinite(item.intrinsicValueRial)
  ) {
    text += `\nحباب سکه: ${money(item.bubbleRial, chat.unit, item.id)} (${(item.bubblePercent || 0).toFixed(1)}%) • ارزش ذاتی: ${money(item.intrinsicValueRial, chat.unit, item.id)}`;
  }

  text += `\nزمان دریافت از منبع: ${localTime(Date.parse(item.observedAt))} (تهران)\nساعت اعلام‌شدهٔ منبع: ${item.updatedAt || "نامشخص"}`;

  const inlineRows = [[{ text: "مشاهدهٔ زرپایش", url: SITE_URL }]];
  if (chat.id > 0) {
    inlineRows.unshift([
      { text: "📈 نمودار ۲۴ساعته", callback_data: `pv:plot:${item.id}:24` },
      { text: "📊 نمودار ۷روزه", callback_data: `pv:plot:${item.id}:168` },
    ]);
  }

  const params = {
    chat_id: chat.id,
    disable_notification: Boolean(chat.silent),
    reply_markup: {
      inline_keyboard: inlineRows,
    },
  };
  if (options.chart && points.length >= 2) {
    const firstPrice = points[0].price;
    const lastPrice = points[points.length - 1].price;
    const minPrice = Math.min(...points.map((p) => p.low ?? p.price));
    const maxPrice = Math.max(...points.map((p) => p.high ?? p.price));
    const avgPrice =
      points.reduce((sum, p) => sum + p.price, 0) / points.length;
    const deltaPct =
      firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
    const deltaSign = deltaPct > 0 ? "+" : "";

    text += `\n📈 نمودار ${options.hours || 24} ساعت اخیر؛ ${points.length} نمونه`;
    text += `\nتغییر بازه: ${deltaSign}${deltaPct.toFixed(2)}% • میانگین: ${money(avgPrice, chat.unit, item.id)}`;
    text += `\nکف و سقف بازه: ${money(minPrice, chat.unit, item.id)} تا ${money(maxPrice, chat.unit, item.id)}`;
    text += `\nمنبع نمودار: ${chart.source}\nبازهٔ واقعی: ${localTime(points[0].at)} تا ${localTime(points[points.length - 1].at)}\nمحور قیمت: ${item.id === "ons" ? "دلار" : chat.unit === "rial" ? "ریال" : "تومان"}؛ ساعت تهران`;
    if (points.every((p) => p.price === points[0].price))
      text +=
        "\nدر این نمونه‌ها تغییری ثبت نشده؛ خط صاف نشان‌دهندهٔ همین داده است.";
    // Let upload/delivery errors propagate: a timeout may mean Telegram already accepted it.
    return api.sendPhoto({
      ...params,
      photo: new InputFile(
        chartPng(points, chat.unit, item.id),
        `${item.id}.png`,
        { type: "image/png" },
      ),
      caption: text,
    });
  }
  if (options.chart)
    text +=
      "\n📊 تاریخچهٔ این بازه نمونهٔ کافی ندارد؛ بازهٔ ۷ روز را امتحان کنید یا پس از ثبت نمونه‌های بیشتر دوباره درخواست بدهید.";
  return api.sendMessage({
    ...params,
    text,
    link_preview_options: { is_disabled: true },
  });
}
