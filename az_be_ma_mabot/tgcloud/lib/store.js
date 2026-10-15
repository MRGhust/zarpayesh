import { db } from 'sdk';
import { eq, and, gte, asc, lt } from 'sdk/db';
import { chats, subscriptions, observations, alerts } from '../schema.js';
export async function getChat(id) {
  await db.insert(chats).values({ id }).onConflictDoNothing({ target: chats.id }).run();
  return db.select().from(chats).where(eq(chats.id, id)).get();
}
export async function setChat(id, values) { await db.update(chats).set(values).where(eq(chats.id, id)).run(); }
export async function listSubs(id) { return db.select().from(subscriptions).where(eq(subscriptions.chatId, id)).all(); }
export async function listAlerts(id) { return db.select().from(alerts).where(eq(alerts.chatId, id)).all(); }
export async function history(asset, hours, now) {
  return db.select().from(observations)
    .where(and(eq(observations.asset, asset), gte(observations.at, now - hours * 3600000)))
    .orderBy(asc(observations.at)).all();
}
export async function record(items, now) {
  const bucket = Math.floor(now / 300000) * 300000;
  for (const item of items) {
    await db.insert(observations).values({ id: `${item.id}:${bucket}`, asset: item.id, at: Date.parse(item.observedAt), price: item.priceRial })
      .onConflictDoNothing({ target: observations.id }).run();
  }
  await db.delete(observations).where(lt(observations.at, now - 7 * 86400000)).run();
}
export async function removeChat(id) {
  await db.delete(subscriptions).where(eq(subscriptions.chatId, id)).run();
  await db.delete(alerts).where(eq(alerts.chatId, id)).run();
  await db.delete(chats).where(eq(chats.id, id)).run();
}
