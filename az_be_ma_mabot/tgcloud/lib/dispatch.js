import { db } from 'sdk';
import { eq, and, lte } from 'sdk/db';
import { subscriptions, alerts, state } from '../schema.js';
import { getChat, removeChat } from './store.js';
import { market } from './market.js';
import { sendPrice } from './send.js';
import { inQuiet, nextDue } from './config.js';
export async function dispatch() {
 const now = Date.now(), lease = now + 120000;
 await db.insert(state).values({ id: 'scheduler', value: 0 }).onConflictDoNothing({ target: state.id }).run();
 const claim = await db.update(state).set({ value: lease }).where(and(eq(state.id, 'scheduler'), lte(state.value, now))).run();
 if (!claim.rowsAffected) return { busy: true };
 try {
  // Poll once for the whole fleet; builds history even between notifications.
  let items;
  try { items = await market(now); }
  catch { console.warn('Market unavailable: no prices or alerts delivered.'); throw new Error('MARKET_UNAVAILABLE'); }
  const due = await db.select().from(subscriptions).where(and(lte(subscriptions.nextAt, now), lte(subscriptions.leaseUntil, now))).orderBy(subscriptions.nextAt).limit(20).all();
  let sent = 0;
  for (const sub of due) {
   const chat = await getChat(sub.chatId), nextAt = nextDue(sub, now);
   const claimed = await db.update(subscriptions).set({ leaseUntil: lease }).where(and(eq(subscriptions.id, sub.id), eq(subscriptions.nextAt, sub.nextAt), lte(subscriptions.leaseUntil, now))).run();
   if (!claimed.rowsAffected) continue;
   if (chat.paused || inQuiet(chat, now)) {
    await db.update(subscriptions).set({ nextAt, leaseUntil: 0 }).where(and(eq(subscriptions.id, sub.id), eq(subscriptions.leaseUntil, lease))).run(); continue;
   }
   if (!items[sub.asset]) {
    await db.update(subscriptions).set({ nextAt: now + 300000, leaseUntil: 0 }).where(and(eq(subscriptions.id, sub.id), eq(subscriptions.leaseUntil, lease))).run(); continue;
   }
   try {
    await sendPrice(chat, items[sub.asset], sub, now); sent++;
    await db.update(subscriptions).set({ nextAt, leaseUntil: 0, failures: 0 }).where(and(eq(subscriptions.id, sub.id), eq(subscriptions.leaseUntil, lease))).run();
   } catch (error) {
    if (error.code === 403 || (error.code === 400 && /chat not found|kicked|not enough rights/i.test(error.description || ''))) { await removeChat(chat.id); continue; }
    const delay = Math.max(Number(error.parameters?.retry_after || 0) * 1000, Math.min(3600000, 300000 * 2 ** Math.min(sub.failures, 4)));
    await db.update(subscriptions).set({ nextAt: now + delay, leaseUntil: 0, failures: sub.failures + 1 }).where(and(eq(subscriptions.id, sub.id), eq(subscriptions.leaseUntil, lease))).run();
    console.warn('Delivery deferred', { asset: sub.asset, code: error.code || 'transport' });
   }
  }
  const pending = await db.select().from(alerts).where(and(lte(alerts.nextAt, now), lte(alerts.leaseUntil, now))).limit(30).all();
  for (const alert of pending) {
   const chat = await getChat(alert.chatId), item = items[alert.asset];
   if (chat.paused || inQuiet(chat, now) || !item) continue;
   if (!(alert.direction === 'above' ? item.priceRial >= alert.threshold : item.priceRial <= alert.threshold)) continue;
   const claimed = await db.update(alerts).set({ leaseUntil: lease }).where(and(eq(alerts.id, alert.id), lte(alerts.leaseUntil, now))).run();
   if (!claimed.rowsAffected) continue;
   try {
    await sendPrice(chat, item, { prefix: '🔔 آستانهٔ هشدار قیمت فعال شد' }, now); sent++;
    await db.delete(alerts).where(and(eq(alerts.id, alert.id), eq(alerts.leaseUntil, lease))).run();
   } catch (error) {
    if (error.code === 403) { await removeChat(chat.id); continue; }
    await db.update(alerts).set({ nextAt: now + Math.max(300000, Number(error.parameters?.retry_after || 0) * 1000), leaseUntil: 0 }).where(and(eq(alerts.id, alert.id), eq(alerts.leaseUntil, lease))).run();
   }
  }
  return { sent, examined: due.length + pending.length, observed: Object.keys(items).length };
 } finally {
  await db.update(state).set({ value: 0 }).where(and(eq(state.id, 'scheduler'), eq(state.value, lease))).run();
 }
}
