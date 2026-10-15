import { db } from 'sdk';
import { eq, and } from 'sdk/db';
import { subscriptions, alerts, chats } from '../schema.js';
import { UserError, ASSETS, assetId, digits, clockMinute, nextDue, money } from './config.js';
import { getChat, setChat, listSubs, listAlerts } from './store.js';
import { market } from './market.js';
import { sendPrice } from './send.js';
import { settings, HELP } from './settings.js';
import { isAdmin } from './access.js';
function requiredAsset(value) { const id = assetId(value); if (!id) throw new UserError('نماد معتبر نیست؛ /assets را ببینید.'); return id; }
function chartFlag(value = 'off') { if (!['on', 'off'].includes(value)) throw new UserError('وضعیت نمودار باید on یا off باشد.'); return value === 'on' ? 1 : 0; }
function hours(value = '24') { const n = Number(value); if (!Number.isInteger(n) || n < 1 || n > 168) throw new UserError('بازهٔ نمودار باید ۱ تا ۱۶۸ ساعت باشد.'); return n; }
export async function command(message, raw) {
 const now = Date.now(), chat = await getChat(message.chat.id);
 const parts = digits(raw).trim().split(/\s+/), name = parts.shift().replace(/^\//, '').split('@')[0].toLowerCase();
 const [a, b, c, d] = parts;
 if (['start', 'help'].includes(name)) return { text: HELP };
 if (name === 'assets') return { text: Object.entries(ASSETS).map(([id, title]) => `${id} — ${title}`).join('\n') };
 if (name === 'price') {
  const asset = requiredAsset(a);
  if (b && b !== 'chart') throw new UserError('نمونه: /price usd chart 24');
  const h = hours(c);
  // Compare-and-set makes the group-wide ten-second limit atomic.
  if (now - chat.lastRequest < 10000) return { text: 'برای درخواست بعدی چند ثانیه صبر کنید.' };
  const claim = await db.update(chats).set({ lastRequest: now }).where(and(eq(chats.id, chat.id), eq(chats.lastRequest, chat.lastRequest))).run();
  if (!claim.rowsAffected) return { text: 'برای درخواست بعدی چند ثانیه صبر کنید.' };
  let items;
  try { items = await market(now); } catch { return { text: 'منبع قیمت زنده در دسترس نیست یا دادهٔ تأییدشده و تازه ندارد. کمی بعد دوباره امتحان کنید.' }; }
  if (!items[asset]) return { text: 'برای این نماد فعلاً دادهٔ زندهٔ تأییدشده موجود نیست.' };
  await sendPrice(chat, items[asset], { chart: b === 'chart', hours: h }, now);
  return null;
 }
 if (!(await isAdmin(message.chat, message.from))) return { text: 'فقط مدیران گروه می‌توانند تنظیمات را ببینند یا تغییر دهند.' };
 if (name === 'settings') return settings(chat);
 if (['schedule', 'daily'].includes(name)) {
  const asset = requiredAsset(a), dailyMinute = name === 'daily' ? clockMinute(b) : -1;
  const minutes = name === 'daily' ? 1440 : Number(b);
  if (!Number.isInteger(minutes) || minutes < 5 || minutes > 10080) throw new UserError('فاصلهٔ ارسال باید عددی بین ۵ و ۱۰۰۸۰ دقیقه باشد.');
  const existing = await listSubs(chat.id);
  if (!existing.some(s => s.asset === asset) && existing.length >= 20) throw new UserError('حداکثر ۲۰ برنامه برای هر گفتگو مجاز است.');
  const sub = { id: `${chat.id}:${asset}`, chatId: chat.id, asset, minutes, dailyMinute, chart: chartFlag(c), hours: hours(d), leaseUntil: 0, failures: 0 };
  sub.nextAt = nextDue(sub, now);
  await db.insert(subscriptions).values(sub).onConflictDoUpdate({ target: subscriptions.id, set: sub }).run();
  return settings(chat);
 }
 if (name === 'unschedule') {
  await db.delete(subscriptions).where(eq(subscriptions.id, `${chat.id}:${requiredAsset(a)}`)).run(); return settings(chat);
 }
 if (name === 'chart') {
  const id = `${chat.id}:${requiredAsset(a)}`, chart = chartFlag(b), h = hours(c);
  const existing = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).get();
  if (!existing) throw new UserError('ابتدا با /schedule برای این نماد برنامه بسازید.');
  await db.update(subscriptions).set({ chart, hours: h }).where(eq(subscriptions.id, id)).run(); return settings(chat);
 }
 if (name === 'pause' || name === 'resume') await setChat(chat.id, { paused: name === 'pause' ? 1 : 0 });
 else if (name === 'unit') {
  if (!['toman', 'rial'].includes(a)) throw new UserError('واحد باید toman یا rial باشد.'); await setChat(chat.id, { unit: a });
 } else if (name === 'silent') {
  if (!['on', 'off'].includes(a)) throw new UserError('از /silent on یا /silent off استفاده کنید.'); await setChat(chat.id, { silent: a === 'on' ? 1 : 0 });
 } else if (name === 'quiet') {
  if (a === 'off') await setChat(chat.id, { quietStart: -1, quietEnd: -1 });
  else { const start = clockMinute(a), end = clockMinute(b); if (start === end) throw new UserError('شروع و پایان ساعات سکوت باید متفاوت باشند.'); await setChat(chat.id, { quietStart: start, quietEnd: end }); }
 } else if (name === 'alert') {
  const asset = requiredAsset(a), threshold = Number((c || '').replace(/[,٬]/g, ''));
  if (!['above', 'below'].includes(b) || !Number.isFinite(threshold) || threshold <= 0 || threshold > 1e15) throw new UserError('نمونه: /alert usd above 100000');
  const all = await listAlerts(chat.id), id = `${chat.id}:${asset}:${b}`;
  if (all.length >= 30 && !all.some(x => x.id === id)) throw new UserError('حداکثر ۳۰ هشدار برای هر گفتگو مجاز است.');
  const row = { id, chatId: chat.id, asset, direction: b, threshold: asset === 'ons' || chat.unit === 'rial' ? threshold : threshold * 10, nextAt: 0, leaseUntil: 0 };
  await db.insert(alerts).values(row).onConflictDoUpdate({ target: alerts.id, set: row }).run();
  return { text: `هشدار یک‌بارهٔ ${ASSETS[asset]} برای ${money(row.threshold, chat.unit, asset)} ثبت شد. شناسه: ${asset}:${b}` };
 } else if (name === 'alerts') {
  const all = await listAlerts(chat.id);
  return { text: all.length ? all.map(x => `${x.asset}:${x.direction} — ${money(x.threshold, chat.unit, x.asset)}`).join('\n') : 'هشدار فعالی ندارید.' };
 } else if (name === 'unalert') {
  const [asset, dir] = (a || '').split(':'); requiredAsset(asset);
  if (!['above', 'below'].includes(dir)) throw new UserError('نمونه: /unalert usd:above');
  await db.delete(alerts).where(eq(alerts.id, `${chat.id}:${asset}:${dir}`)).run(); return { text: 'هشدار حذف شد.' };
 } else return { text: 'دستور شناخته نشد؛ /help را ببینید.' };
 return settings(await getChat(chat.id));
}
