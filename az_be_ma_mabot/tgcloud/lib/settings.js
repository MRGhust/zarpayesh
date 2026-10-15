import { ASSETS, localTime } from './config.js';
import { listSubs, listAlerts } from './store.js';
const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export async function settings(chat) {
 const subs = await listSubs(chat.id), alerts = await listAlerts(chat.id);
 const text = `⚙️ تنظیمات این گفتگو\nاعلام خودکار: ${chat.paused ? 'متوقف' : 'فعال'}\nواحد: ${chat.unit === 'rial' ? 'ریال' : 'تومان'}\nاعلان بی‌صدا: ${chat.silent ? 'بله' : 'خیر'}\nساعات سکوت تهران: ${chat.quietStart < 0 ? 'خاموش' : `${hhmm(chat.quietStart)} تا ${hhmm(chat.quietEnd)}`}\n\n${subs.length ? subs.map(s => `${ASSETS[s.asset]} — ${s.dailyMinute >= 0 ? `روزانه ${hhmm(s.dailyMinute)}` : `هر ${s.minutes} دقیقه`} — نمودار ${s.chart ? `${s.hours} ساعت` : 'خاموش'}\nنوبت بعدی: ${localTime(s.nextAt)}`).join('\n') : 'هنوز برنامه‌ای ثبت نشده است.'}\n\nهشدار فعال: ${alerts.length}\nبا /help راهنمای کامل را ببینید.`;
 const rows = [
  [{ text: chat.paused ? '▶️ ادامه' : '⏸ توقف', callback_data: chat.paused ? 'resume' : 'pause' }, { text: 'تغییر واحد', callback_data: 'unit' }],
  [{ text: 'تغییر اعلان بی‌صدا', callback_data: 'silent' }, { text: 'راهنما', callback_data: 'help' }],
  [{ text: 'دلار ساعتی + نمودار', callback_data: 'hourly:usd' }, { text: 'یورو ساعتی', callback_data: 'hourly:eur' }],
 ];
 for (const s of subs) rows.push([{ text: `${ASSETS[s.asset]}: ${s.chart ? 'خاموش کردن نمودار' : 'روشن کردن نمودار'}`, callback_data: `chart:${s.asset}` }, { text: 'حذف', callback_data: `remove:${s.asset}` }]);
 return { text, reply_markup: { inline_keyboard: rows } };
}
export const HELP = `💱 بات زرپایش
در گروه، فقط مدیران اجازهٔ تغییر تنظیمات دارند. برای تشخیص مدیران، بات را مدیر گروه کنید.

/price usd — قیمت فعلی دلار
/price usd chart 24 — قیمت و نمودار ۲۴ ساعت اخیر
/assets — فهرست نمادها
/settings — پنل تنظیمات
/schedule usd 60 on 24 — هر ساعت دلار با نمودار ۲۴ساعته
/schedule eur 120 off — هر دو ساعت یورو بدون تصویر
/daily geram18 09:00 on 168 — هر روز ساعت ۹ تهران با نمودار یک هفته
/chart usd off — خاموش کردن نمودار دلار
/chart usd on 6 — روشن کردن نمودار ۶ساعته
/unschedule usd — حذف برنامهٔ دلار
/pause — توقف اعلام‌های خودکار و هشدارها
/resume — ادامه
/unit toman — تومان (یا rial)
/quiet 23:00 08:00 — ساعات سکوت تهران
/quiet off — لغو ساعات سکوت
/silent on — اعلان بی‌صدا (یا off)
/alert usd above 100000 — هشدار یک‌باره بالاتر از آستانه، با واحد فعلی گفتگو
/alert eur below 90000 — هشدار یک‌باره پایین‌تر از آستانه
/alerts — فهرست و شناسهٔ هشدارها
/unalert usd:above — حذف هشدار

نماد فارسی دلار، یورو، درهم، پوند، لیر، طلا و سکه هم پذیرفته می‌شود. اعداد فارسی مجازند.
بازهٔ ارسال ۵ تا ۱۰۰۸۰ دقیقه و نمودار ۱ تا ۱۶۸ ساعت است. برنامه‌های ساعتی بر ساعت تهران منطبق‌اند.
قیمت‌ها در لحظهٔ درخواست دریافت می‌شوند؛ بررسی خودکار تقریباً هر ۵ دقیقه است و اجرای GitHub ممکن است تأخیر داشته باشد. طی سکوت، پیام‌های عقب‌افتاده انباشته نمی‌شوند.
نمودار فقط نمونه‌های واقعی ثبت‌شده از زمان فعال‌سازی را دارد. دادهٔ نمونه، تخمینی یا قدیمی ارسال نمی‌شود.`;
