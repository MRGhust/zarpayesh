export interface HistoryPoint {
  at: number;
  price: number;
  open?: number;
  high?: number;
  low?: number;
}
export const HISTORY_RANGES = {
  "1H": 1 / 24,
  "1D": 1,
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
} as const;
export type HistoryRange = keyof typeof HISTORY_RANGES;
export const HISTORY_SYMBOLS = new Set([
  "price_dollar_rl",
  "price_eur",
  "price_aed",
  "price_gbp",
  "price_try",
  "price_cad",
  "price_chf",
  "price_cny",
  "price_iqd",
  "price_azn",
  "price_rub",
  "ons",
  "geram18",
  "geram24",
  "mesghal",
  "sekee",
  "sekeb",
  "nim",
  "rob",
  "gerami",
]);
function number(value: unknown): number {
  return typeof value === "number"
    ? value
    : Number(String(value).replace(/[,٬]/g, ""));
}
export function parseDailyHistory(
  input: unknown,
  now = Date.now(),
): HistoryPoint[] {
  const rows = (input as { data?: unknown })?.data;
  if (!Array.isArray(rows)) throw new Error("Invalid history response");
  return cleanHistory(
    rows.flatMap((row) => {
      if (
        !Array.isArray(row) ||
        typeof row[6] !== "string" ||
        !/^\d{4}\/\d{2}\/\d{2}$/.test(row[6])
      )
        return [];
      const point = {
        at: Date.parse(`${row[6].replaceAll("/", "-")}T00:00:00+03:30`),
        open: number(row[0]),
        low: number(row[1]),
        high: number(row[2]),
        price: number(row[3]),
      };
      return [point.open, point.low, point.high].every(
        (v) => Number.isFinite(v) && v > 0,
      ) &&
        point.high >= Math.max(point.open, point.price, point.low) &&
        point.low <= Math.min(point.open, point.price)
        ? [point]
        : [];
    }),
    now,
  );
}
export function parseIntradayHistory(
  html: string,
  now = Date.now(),
): HistoryPoint[] {
  // Parse only the published JSON numeric array; never execute source JavaScript.
  const match =
    /"#ChartBlock-0"\)[\s\S]{0,160}?chartData:\s*(\[[^\r\n]*\])/.exec(html);
  if (!match) throw new Error("Intraday chart is unavailable");
  const rows = JSON.parse(match[1]);
  if (!Array.isArray(rows)) throw new Error("Invalid intraday chart");
  return cleanHistory(
    rows
      .filter((r) => Array.isArray(r) && r.length === 2)
      .map((r) => ({ at: number(r[0]), price: number(r[1]) })),
    now,
  );
}
export function cleanHistory(
  points: HistoryPoint[],
  now: number,
): HistoryPoint[] {
  const unique = new Map<number, HistoryPoint>();
  for (const p of points)
    if (
      Number.isFinite(p.at) &&
      p.at > 0 &&
      p.at <= now + 30000 &&
      Number.isFinite(p.price) &&
      p.price > 0
    )
      unique.set(p.at, p);
  return [...unique.values()].sort((a, b) => a.at - b.at);
}
// Keep actual OHLC extremes when aggregating; never interpolate invented prices.
export function aggregateHistory(
  points: HistoryPoint[],
  maxPoints = 300,
): HistoryPoint[] {
  if (points.length <= maxPoints) return points;
  const span = Math.max(
    1,
    Math.ceil((points.at(-1)!.at - points[0].at + 1) / maxPoints),
  );
  const buckets = new Map<number, HistoryPoint>();
  for (const p of points) {
    const key = Math.floor((p.at - points[0].at) / span),
      old = buckets.get(key);
    buckets.set(key, {
      at: p.at,
      price: p.price,
      open: old?.open ?? p.open ?? p.price,
      high: Math.max(old?.high ?? p.price, p.high ?? p.price),
      low: Math.min(old?.low ?? p.price, p.low ?? p.price),
    });
  }
  return [...buckets.values()];
}
