import { api, db, EndpointError } from 'sdk';
import { chats, subscriptions, observations } from '../schema.js';
import { market } from '../lib/market.js';
import { chartPng } from '../lib/chart.js';
import { money } from '../lib/config.js';
export default async function(input, ctx) {
 if (ctx?.operator !== true) throw new EndpointError('Management CLI only');
 if (input.action === 'register') {
  await api.setMyCommands({ commands: [
   { command: 'price', description: 'قیمت زنده؛ نمونه: /price usd' },
   { command: 'settings', description: 'تنظیمات و برنامه‌های این گروه' },
   { command: 'schedule', description: 'برنامهٔ خودکار؛ /schedule usd 60 on' },
   { command: 'assets', description: 'فهرست ارزها، طلا و سکه' },
   { command: 'help', description: 'راهنمای کامل فارسی' },
  ] });
 }
 const me = await api.getMe();
 if (input.action === 'status') return { username: me.username, chats: await db.$count(chats), schedules: await db.$count(subscriptions), observations: await db.$count(observations) };
 if (input.action === 'market') {
  const items = await market(); return { assets: Object.keys(items) };
 }
 // Runtime compatibility smoke check, without sending a message to any chat.
 const png = chartPng([{ at: 0, price: 100 }, { at: 300000, price: 110 }]);
 return { username: me.username, id: me.id, number: money(1000, 'toman', 'usd'), pngBytes: png.length };
}
