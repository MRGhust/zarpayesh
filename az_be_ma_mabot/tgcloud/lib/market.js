import { fetch } from 'sdk';
import { ASSETS, MARKET_URL, validItem } from './config.js';
import { record } from './store.js';
export async function market(now = Date.now()) {
  const response = await fetch(MARKET_URL);
  if (!response.ok) throw new Error(`market_http_${response.status}`);
  const data = await response.json();
  if (!['tgju', 'cache', 'bonbast'].includes(data.source) || !data.items) throw new Error('market_unverified');
  const items = Object.keys(ASSETS).map(id => data.items[id])
    .filter(item => item && ASSETS[item.id] && validItem(item, now));
  if (!items.length) throw new Error('market_no_fresh_observations');
  await record(items, now);
  return Object.fromEntries(items.map(item => [item.id, item]));
}
