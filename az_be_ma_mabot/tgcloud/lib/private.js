import { ASSETS, SITE_URL } from "./config.js";
export const PRIVATE_KEYBOARD = {
  keyboard: [
    [{ text: "💵 دلار" }, { text: "💶 یورو" }, { text: "🥇 طلا" }],
    [{ text: "📈 نمودار واقعی" }, { text: "💱 همه ارزها" }],
    [{ text: "⚙️ تنظیمات من" }, { text: "🔔 هشدارهای من" }],
    [{ text: "➕ افزودن به گروه" }, { text: "📖 راهنما" }],
  ],
  resize_keyboard: true,
  is_persistent: true,
  input_field_placeholder: "نام دارایی، نمودار یا تنظیمات را انتخاب کنید",
};
export const PRIVATE_ACTIONS = {
  "💵 دلار": "/price usd",
  "💶 یورو": "/price eur",
  "🥇 طلا": "/price geram18",
  "💱 همه ارزها": "/browse",
  "📈 نمودار واقعی": "/charts",
  "⚙️ تنظیمات من": "/settings",
  "🔔 هشدارهای من": "/alerts",
  "📖 راهنما": "/help",
  "➕ افزودن به گروه": "/addgroup",
};
const button = (text, callback_data) => ({ text, callback_data });
export function privatePanel(name, asset) {
  if (name === "addgroup")
    return {
      text: "➕ زرپایش در گروه شما\nبات را اضافه و مدیر کنید، سپس در همان گروه /settings را بزنید. تنظیمات هر گروه جدا ذخیره می‌شود.",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "افزودن زرپایش به گروه",
              url: "https://t.me/az_be_ma_mabot?startgroup=true",
            },
          ],
          [{ text: "مشاهدهٔ سایت", url: SITE_URL }],
        ],
      },
    };
  if (name === "charts" && asset && Object.hasOwn(ASSETS, asset))
    return {
      text: `📈 نمودار واقعی ${ASSETS[asset]}\nبازهٔ زمانی را انتخاب کنید. داده از تاریخچهٔ TGJU دریافت می‌شود؛ در صورت نبود داده، توضیح دقیق نمایش داده می‌شود.`,
      reply_markup: {
        inline_keyboard: [
          [
            button("۱ ساعت اخیر", `pv:plot:${asset}:1`),
            button("۲۴ ساعت اخیر", `pv:plot:${asset}:24`),
          ],
          [
            button("۳ روز اخیر", `pv:plot:${asset}:72`),
            button("۷ روز اخیر", `pv:plot:${asset}:168`),
          ],
          [button("↩️ انتخاب ارز", "pv:charts")],
        ],
      },
    };
  const chart = name === "charts";
  const entries = Object.entries(ASSETS).filter(([id]) => id !== "uah");
  const rows = [];
  for (let i = 0; i < entries.length; i += 2)
    rows.push(
      entries
        .slice(i, i + 2)
        .map(([id, title]) =>
          button(title, `pv:${chart ? "choose" : "price"}:${id}`),
        ),
    );
  return {
    text: chart
      ? "📈 نمودار کدام دارایی را می‌خواهید؟"
      : "💱 بازار زرپایش\nیک دارایی انتخاب کنید تا آخرین نرخ معتبر دریافت شود.",
    reply_markup: { inline_keyboard: rows },
  };
}
export const PRIVATE_WELCOME =
  "✨ به زرپایش خوش آمدید\n\nقیمت ارز، طلا و سکه را ببینید، نمودار واقعی بگیرید و برای خودتان یا گروه برنامهٔ اعلام قیمت بسازید.\n\nمی‌توانید نام دارایی (مثلاً دلار، طلا، سکه) را مستقیماً بنویسید یا از دکمه‌های پایین شروع کنید؛ برای جزئیات /help را بزنید.";
