import { registerHooks } from 'node:module';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { inflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
registerHooks({ resolve(specifier, context, nextResolve) {
 if (specifier === 'sdk' || specifier === 'sdk/db') return { url: new URL('./sdk.js', import.meta.url).href, shortCircuit: true };
 return nextResolve(specifier, context);
} });
const sdk = await import('./sdk.js');
const { command } = await import('../tgcloud/lib/commands.js');
const { getChat, listSubs, listAlerts, history } = await import('../tgcloud/lib/store.js');
const { nextDue, inQuiet, validItem } = await import('../tgcloud/lib/config.js');
const { chartPng } = await import('../tgcloud/lib/chart.js');
const { dispatch } = await import('../tgcloud/lib/dispatch.js');
const { default: endpoint } = await import('../tgcloud/endpoints/dispatch.js');
const { default: callback } = await import('../tgcloud/handlers/callback_query.js');
const { default: member } = await import('../tgcloud/handlers/my_chat_member.js');
const message = { chat: { id: -1001, type: 'supergroup' }, from: { id: 50 } };
function response(price = 1000000, asset = 'usd') {
 const item = { id: asset, dataQuality: 'live', observedAt: new Date().toISOString(), priceRial: price, updatedAt: '12:00' };
 sdk.controls.response = { ok: true, async json() { return { source: 'tgju', items: { [asset]: item } }; } };
 return item;
}
beforeEach(() => sdk.reset());
test('non-admin commands and stale inline buttons cannot alter settings', async () => {
 assert.match((await command(message, '/schedule usd 60 on')).text, /فقط مدیران/);
 assert.equal((await listSubs(message.chat.id)).length, 0);
 await callback({ id: 'q', from: message.from, message: { ...message, message_id: 1 }, data: 'hourly:usd' });
 assert.equal((await listSubs(message.chat.id)).length, 0);
 assert.equal(sdk.sent.at(-1).show_alert, true);
});
test('group isolation, Persian digits, per-asset chart and schedule replacement', async () => {
 sdk.controls.admin = true;
 await command(message, '/schedule دلار ۶۰ on ۲۴');
 await command(message, '/schedule eur 120 off');
 await command({ ...message, chat: { id: -1002, type: 'supergroup' } }, '/schedule usd 30 off');
 await command(message, '/chart usd off');
 const subs = await listSubs(-1001);
 assert.equal(subs.length, 2); assert.equal(subs.find(x => x.asset === 'usd').chart, 0);
 assert.equal((await listSubs(-1002))[0].minutes, 30);
 await command(message, '/schedule usd 180 on 6');
 assert.equal((await listSubs(-1001)).length, 2);
 assert.equal((await listSubs(-1001)).find(x => x.asset === 'usd').hours, 6);
});
test('reject invalid intervals, clock, chart and threshold', async () => {
 sdk.controls.admin = true;
 for (const text of ['/schedule usd 0 on', '/schedule usd 4 on', '/daily usd 24:00', '/chart usd maybe', '/schedule usd 60 on 169', '/alert usd above NaN', '/quiet 23:00 23:00']) await assert.rejects(command(message, text));
});
test('Tehran whole-hour schedule, daily rollover and overnight quiet', () => {
 const now = Date.parse('2026-10-15T06:45:00Z'); // Tehran 10:15
 assert.equal(nextDue({ minutes: 60, dailyMinute: -1 }, now), Date.parse('2026-10-15T07:30:00Z'));
 assert.equal(nextDue({ dailyMinute: 600 }, now), Date.parse('2026-10-16T06:30:00Z'));
 assert.equal(inQuiet({ quietStart: 1380, quietEnd: 480 }, Date.parse('2026-10-15T21:00:00Z')), true);
 assert.equal(inQuiet({ quietStart: 1380, quietEnd: 480 }, now), false);
});
test('never accept sample, estimated, stale, future or non-finite prices', () => {
 const now = Date.now(), item = response(); assert.equal(validItem(item, now), true);
 for (const patch of [{ dataQuality: 'sample' }, { dataQuality: 'estimated' }, { observedAt: new Date(now - 181000).toISOString() }, { observedAt: new Date(now + 60000).toISOString() }, { priceRial: Infinity }, { priceRial: 0 }]) assert.equal(validItem({ ...item, ...patch }, now), false);
});
test('live request records observation; sample source does not send a price', async () => {
 response(); await command(message, '/price usd chart 24');
 assert.equal(sdk.sent.at(-1).method, 'sendMessage'); assert.match(sdk.sent.at(-1).text, /تاریخچه هنوز کافی/);
 assert.equal((await history('usd', 24, Date.now())).length, 1);
 sdk.sqlDb.exec('UPDATE zp_chats SET last_request = 0');
 sdk.controls.response = { ok: true, async json() { return { source: 'fallback', items: {} }; } };
 const count = sdk.sent.length, result = await command(message, '/price usd');
 assert.match(result.text, /منبع قیمت زنده/); assert.equal(sdk.sent.length, count);
});
test('unauthenticated Mini App cannot invoke scheduler through body or initData', async () => {
 await assert.rejects(endpoint({ scheduler: true }, { initData: { user: { id: 1 }, scheduler: true } }));
 assert.equal(sdk.controls.fetches, 0);
});
async function scheduleDue() {
 sdk.controls.admin = true; await command(message, '/schedule usd 60 off');
 sdk.sqlDb.exec('UPDATE zp_subscriptions SET next_at = 0'); response();
}
test('due schedule sends once; no duplicate on next tick', async () => {
 await scheduleDue(); assert.equal((await dispatch()).sent, 1);
 assert.equal((await dispatch()).sent, 0);
 assert.equal(sdk.sent.filter(x => x.method === 'sendMessage').length, 1);
});
test('quiet and paused schedules skip backlog; failures retain retry with backoff', async () => {
 await scheduleDue(); await command(message, '/pause');
 assert.equal((await dispatch()).sent, 0); assert.ok((await listSubs(-1001))[0].nextAt > Date.now());
 await command(message, '/resume'); sdk.sqlDb.exec('UPDATE zp_subscriptions SET next_at=0');
 sdk.controls.fail = { code: 429, parameters: { retry_after: 600 } };
 assert.equal((await dispatch()).sent, 0);
 const sub = (await listSubs(-1001))[0]; assert.equal(sub.failures, 1); assert.ok(sub.nextAt > Date.now() + 590000);
});
test('one-shot alerts preserve rial threshold across unit change', async () => {
 sdk.controls.admin = true; await command(message, '/alert usd above 100000');
 await command(message, '/unit rial');
 assert.equal((await listAlerts(-1001))[0].threshold, 1000000);
 response(1100000); assert.equal((await dispatch()).sent, 1); assert.equal((await listAlerts(-1001)).length, 0);
 assert.equal((await dispatch()).sent, 0);
});
test('removed bot cleans up schedules, alerts and settings', async () => {
 await scheduleDue(); await command(message, '/alert usd above 100');
 await member({ chat: message.chat, new_chat_member: { status: 'kicked' } });
 assert.equal((await listSubs(-1001)).length, 0); assert.equal((await listAlerts(-1001)).length, 0);
});
test('global lease prevents overlapping delivery and is released after API failure', async () => {
 sdk.sqlDb.exec("INSERT INTO zp_state VALUES ('scheduler', 9999999999999)");
 assert.equal((await dispatch()).busy, true); assert.equal(sdk.controls.fetches, 0);
 sdk.sqlDb.exec('UPDATE zp_state SET value=0'); sdk.controls.response = { ok: false, status: 404 };
 await assert.rejects(dispatch(), /MARKET_UNAVAILABLE/);
 assert.equal(sdk.sqlDb.prepare('SELECT value FROM zp_state').get().value, 0);
});
test('PNG has correct dimensions, valid zlib stream, flat prices and timestamp spacing', () => {
 const now = Date.now(); const points = Array.from({length: 24}, (_, i) => ({at: now - (24-i)*3600000, price: 1000000 + Math.sin(i/3)*50000}));
 const png = chartPng(points);
 assert.deepEqual([...png.slice(0,8)], [137,80,78,71,13,10,26,10]);
 const view = new DataView(png.buffer); assert.equal(view.getUint32(16), 720); assert.equal(view.getUint32(20), 360);
 const length = view.getUint32(33); const raw = inflateSync(png.slice(41, 41 + length)); assert.equal(raw.length, 360 * (720*3+1));
 assert.doesNotThrow(() => chartPng([{ at: 0, price: 1 }, { at: 1, price: 1 }]));
 if (process.env.CHART_PREVIEW) writeFileSync(process.env.CHART_PREVIEW, png);
});
