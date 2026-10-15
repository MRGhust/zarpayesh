const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const ts = require('typescript');
function compile(path, dependencies, extra = {}) {
 const output = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
 const exports = {};
 vm.runInNewContext(output, { exports, require: name => dependencies[name] || require(name), console: { warn() {} }, AbortController, setTimeout, clearTimeout, ...extra });
 return exports;
}
function createMarket(fetch) {
 const fallback = compile('src/data/mockFallback.ts', {});
 return compile('src/lib/rates.ts', { '@/data/mockFallback': fallback }, { fetch }).fetchLiveTGJU;
}
const liveHtml = '<table><tr data-market-row="price_dollar_rl" data-price="1,000,000"><td class="nf">1,000,000</td><td>10,000 (1%)</td><td>990,000</td><td>1,010,000</td><td>12:00</td></tr></table>';
test('scraped observations are live, missing rows sample, cross-rate estimated', async () => {
 const read = createMarket(async () => ({ ok: true, text: async () => liveHtml }));
 const result = await read();
 assert.equal(result.source, 'tgju');
 assert.equal(result.items.usd.dataQuality, 'live');
 assert.equal(result.items.usd.priceRial, 1000000);
 assert.ok(Number.isFinite(Date.parse(result.items.usd.observedAt)));
 assert.equal(result.items.uah.dataQuality, 'estimated');
 assert.equal(result.items.eur.dataQuality, 'sample');
 assert.equal(result.items.eur.observedAt, undefined);
 assert.equal(result.items.usd, result.items.price_dollar_rl);
});
test('empty HTML and transport failure never become a live response', async () => {
 for (const fetch of [async () => ({ ok: true, text: async () => '<html>blocked</html>' }), async () => { throw new Error('offline'); }]) {
  const result = await createMarket(fetch)();
  assert.equal(result.source, 'fallback');
  assert.ok(Object.values(result.items).every(x => x.dataQuality === 'sample' && !x.observedAt));
 }
});
test('fresh cache does not invent a new observation timestamp', async () => {
 let calls = 0;
 const read = createMarket(async () => { calls++; return { ok: true, text: async () => liveHtml }; });
 const first = await read(), second = await read();
 assert.equal(calls, 1); assert.equal(first.items.usd.observedAt, second.items.usd.observedAt);
});
