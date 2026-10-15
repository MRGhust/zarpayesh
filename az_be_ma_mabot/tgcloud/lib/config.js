export const MARKET_URL = 'https://zarpayesh-five.vercel.app/api/market';
export const SITE_URL = 'https://zarpayesh-five.vercel.app';
export class UserError extends Error {}
export const MAX_AGE_MS = 180000;
export const ASSETS = {
  usd: 'دلار آمریکا', eur: 'یورو', aed: 'درهم امارات', gbp: 'پوند',
  try: 'لیر ترکیه', cad: 'دلار کانادا', chf: 'فرانک سوئیس', cny: 'یوان',
  iqd: '۱۰۰ دینار عراق', azn: 'منات', rub: 'روبل', uah: 'گریونا',
  geram18: 'طلای ۱۸ عیار', geram24: 'طلای ۲۴ عیار', mesghal: 'مثقال طلا',
  ons: 'انس جهانی', sekee: 'سکه امامی', sekeb: 'بهار آزادی',
  nim: 'نیم‌سکه', rob: 'ربع‌سکه', gerami: 'سکه گرمی',
};
export const ALIASES = { دلار: 'usd', یورو: 'eur', درهم: 'aed', پوند: 'gbp', لیر: 'try', طلا: 'geram18', سکه: 'sekee' };
export function assetId(value = '') {
  const id = ALIASES[value] || value.toLowerCase();
  return Object.hasOwn(ASSETS, id) ? id : null;
}
export function digits(value) {
  return String(value).replace(/[۰-۹]/g, c => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)))
    .replace(/[٠-٩]/g, c => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)));
}
export function clockMinute(text) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(digits(text));
  if (!match || +match[1] > 23 || +match[2] > 59) throw new UserError('ساعت باید مانند 09:30 باشد.');
  return +match[1] * 60 + +match[2];
}
export function tehranMinute(now) { return ((Math.floor(now / 60000) + 210) % 1440 + 1440) % 1440; }
export function inQuiet(chat, now) {
  const a = chat.quietStart, b = chat.quietEnd, m = tehranMinute(now);
  if (a < 0 || b < 0 || a === b) return false;
  return a < b ? m >= a && m < b : m >= a || m < b;
}
export function nextDue(sub, now) {
  if (sub.dailyMinute >= 0) {
    let delta = sub.dailyMinute - tehranMinute(now);
    if (delta <= 0) delta += 1440;
    return Math.floor(now / 60000) * 60000 + delta * 60000;
  }
  const span = sub.minutes * 60000, offset = 210 * 60000;
  return (Math.floor((now + offset) / span) + 1) * span - offset;
}
export function money(priceRial, unit, asset) {
  const value = asset === 'ons' || unit === 'rial' ? priceRial : priceRial / 10;
  const label = asset === 'ons' ? 'دلار' : unit === 'rial' ? 'ریال' : 'تومان';
  return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: asset === 'ons' ? 2 : 0 }).format(value)} ${label}`;
}
export function localTime(at) { return new Date(at + 210 * 60000).toISOString().slice(0, 16).replace('T', ' '); }
export function validItem(item, now) {
  const at = Date.parse(item?.observedAt);
  return item?.dataQuality === 'live' && Number.isFinite(item.priceRial) && item.priceRial > 0
    && Number.isFinite(at) && at <= now + 30000 && now - at <= MAX_AGE_MS;
}
