import { api, InputFile } from "sdk";
import { ASSETS, money, localTime, SITE_URL } from "./config.js";
import { chartHistory } from "./price-history.js";
import { chartPng } from "./chart.js";
export async function sendPrice(chat, item, options = {}, now = Date.now()) {
  const chart = options.chart
    ? await chartHistory(item, options.hours || 24, now)
    : { points: [], source: "" };
  const points = chart.points;
  let text = `${options.prefix || "💱 زرپایش"}\n${ASSETS[item.id]}: ${money(item.priceRial, chat.unit, item.id)}\nزمان دریافت از منبع: ${localTime(Date.parse(item.observedAt))} (تهران)\nساعت اعلام‌شدهٔ منبع: ${item.updatedAt || "نامشخص"}`;
  const params = {
    chat_id: chat.id,
    disable_notification: Boolean(chat.silent),
    reply_markup: {
      inline_keyboard: [[{ text: "مشاهدهٔ زرپایش", url: SITE_URL }]],
    },
  };
  if (options.chart && points.length >= 2) {
    text += `\n📈 نمودار ${options.hours || 24} ساعت اخیر؛ ${points.length} نمونه
منبع نمودار: ${chart.source}\nبازهٔ واقعی: ${localTime(points[0].at)} تا ${localTime(points[points.length - 1].at)}\nمحور قیمت: ${item.id === "ons" ? "دلار" : chat.unit === "rial" ? "ریال" : "تومان"}؛ ساعت تهران`;
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
