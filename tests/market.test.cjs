const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const ts = require("typescript");
function compile(path, dependencies, extra = {}) {
  const output = ts.transpileModule(fs.readFileSync(path, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports,
    require: (name) => dependencies[name] || require(name),
    console: { warn() {} },
    AbortController,
    setTimeout,
    clearTimeout,
    ...extra,
  });
  return exports;
}
function createMarket(fetch) {
  const fallback = compile("src/data/mockFallback.ts", {});
  return compile(
    "src/lib/rates.ts",
    { "@/data/mockFallback": fallback },
    { fetch },
  ).fetchLiveTGJU;
}
const liveHtml =
  '<table><tr data-market-row="price_dollar_rl" data-price="1,000,000"><td class="nf">1,000,000</td><td>10,000 (1%)</td><td>990,000</td><td>1,010,000</td><td>12:00</td></tr></table>';
test("scraped observations are live, missing rows sample, cross-rate estimated", async () => {
  const read = createMarket(async () => ({
    ok: true,
    text: async () => liveHtml,
  }));
  const result = await read();
  assert.equal(result.source, "tgju");
  assert.equal(result.items.usd.dataQuality, "live");
  assert.equal(result.items.usd.priceRial, 1000000);
  assert.ok(Number.isFinite(Date.parse(result.items.usd.observedAt)));
  assert.equal(result.items.uah.dataQuality, "estimated");
  assert.equal(result.items.eur.dataQuality, "sample");
  assert.equal(result.items.eur.observedAt, undefined);
  assert.equal(result.items.usd, result.items.price_dollar_rl);
});
test("empty HTML and transport failure never become a live response", async () => {
  for (const fetch of [
    async () => ({ ok: true, text: async () => "<html>blocked</html>" }),
    async () => {
      throw new Error("offline");
    },
  ]) {
    const result = await createMarket(fetch)();
    assert.equal(result.source, "fallback");
    assert.ok(
      Object.values(result.items).every(
        (x) => x.dataQuality === "sample" && !x.observedAt,
      ),
    );
  }
});
test("fresh cache does not invent a new observation timestamp", async () => {
  let calls = 0;
  const read = createMarket(async () => {
    calls++;
    return { ok: true, text: async () => liveHtml };
  });
  const first = await read(),
    second = await read();
  assert.equal(calls, 1);
  assert.equal(first.items.usd.observedAt, second.items.usd.observedAt);
});

test("negative changes follow source low marker and synthetic sparkline is removed", async () => {
  const html = liveHtml.replace(
    "10,000 (1%)",
    '<span class="low">(1%) 10,000</span>',
  );
  const result = await createMarket(async () => ({
    ok: true,
    text: async () => html,
  }))();
  assert.equal(result.items.usd.changePercent, -1);
  assert.equal(result.items.usd.changeRial, -10000);
  assert.equal(result.items.usd.sparkline, undefined);
  assert.equal(result.items.usd.buyPriceRial, undefined);
});
const historyModule = compile("src/lib/history.ts", {});
test("intraday parser reads numeric JSON only and deduplicates timestamps", () => {
  const now = Date.now(),
    html = `$("#ChartBlock-0").msHighcharts({ chartData: [[${now - 1000},100],[${now},120],[${now},125]],\n title: 'x' });`;
  const points = historyModule.parseIntradayHistory(html, now);
  assert.equal(points.length, 2);
  assert.equal(points[1].price, 125);
  assert.throws(() =>
    historyModule.parseIntradayHistory("chartData: malicious()", now),
  );
});
test("daily OHLC parsing validates source columns and chronological ordering", () => {
  const points = historyModule.parseDailyHistory(
    {
      data: [
        ["1,000", "900", "1,200", "1,100", "", "", "2026/10/14"],
        ["1,000", "2,000", "900", "1,100", "", "", "2026/10/13"],
      ],
    },
    Date.parse("2026-10-15"),
  );
  assert.equal(points.length, 1);
  assert.equal(points[0].price, 1100);
  assert.equal(points[0].low, 900);
});
test("history aggregation preserves actual opens, closes, high and low", () => {
  const points = Array.from({ length: 1000 }, (_, i) => ({
    at: 1000 + i,
    price: 100 + (i % 4),
  }));
  const result = historyModule.aggregateHistory(points, 100);
  assert.ok(result.length <= 100);
  assert.equal(result[0].open, 100);
  assert.equal(result[0].high, 103);
  assert.equal(result[0].low, 100);
  assert.equal(result.at(-1).price, 103);
});
const formatters = compile("src/lib/formatters.ts", {});
test("localized amount parsing and percent signs are consistent", () => {
  assert.equal(formatters.parseLocalizedNumber("۱٬۲۳۴٫۵"), 1234.5);
  assert.equal(formatters.parseLocalizedNumber("٠٫٥"), 0.5);
  assert.ok(Number.isNaN(formatters.parseLocalizedNumber("-10")));
  assert.ok(Number.isNaN(formatters.parseLocalizedNumber("")));
  assert.match(formatters.formatPercent(-2).text, /^-/);
  assert.equal(formatters.formatPrice(100, "rial"), "۱٬۰۰۰");
});
