import { table, text, integer, real, index } from 'sdk/db';
export const chats = table('zp_chats', {
  id: integer('id').primaryKey(), unit: text('unit').notNull().default('toman'),
  paused: integer('paused').notNull().default(0),
  quietStart: integer('quiet_start').notNull().default(-1), quietEnd: integer('quiet_end').notNull().default(-1),
  silent: integer('silent').notNull().default(0), lastRequest: integer('last_request').notNull().default(0),
});
export const subscriptions = table('zp_subscriptions', {
  id: text('id').primaryKey(), chatId: integer('chat_id').notNull(), asset: text('asset').notNull(),
  minutes: integer('minutes').notNull(), dailyMinute: integer('daily_minute').notNull().default(-1),
  chart: integer('chart').notNull().default(0), hours: integer('hours').notNull().default(24),
  nextAt: integer('next_at').notNull(), leaseUntil: integer('lease_until').notNull().default(0),
  failures: integer('failures').notNull().default(0),
}, t => ({ due: index('zp_sub_due').on(t.nextAt) }));
export const observations = table('zp_observations', {
  id: text('id').primaryKey(), asset: text('asset').notNull(), at: integer('at').notNull(), price: real('price').notNull(),
}, t => ({ history: index('zp_history').on(t.asset, t.at) }));
export const alerts = table('zp_alerts', {
  id: text('id').primaryKey(), chatId: integer('chat_id').notNull(), asset: text('asset').notNull(),
  direction: text('direction').notNull(), threshold: real('threshold').notNull(),
  nextAt: integer('next_at').notNull().default(0), leaseUntil: integer('lease_until').notNull().default(0),
});
export const state = table('zp_state', { id: text('id').primaryKey(), value: integer('value').notNull().default(0) });
