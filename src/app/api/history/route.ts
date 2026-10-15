import { NextRequest, NextResponse } from "next/server";
import {
  HISTORY_RANGES,
  HISTORY_SYMBOLS,
  HistoryRange,
  parseDailyHistory,
  parseIntradayHistory,
  aggregateHistory,
} from "@/lib/history";
export async function GET(request: NextRequest) {
  const symbol =
    request.nextUrl.searchParams.get("symbol") || "price_dollar_rl";
  const range = request.nextUrl.searchParams.get("range") || "1W";
  if (!HISTORY_SYMBOLS.has(symbol) || !Object.hasOwn(HISTORY_RANGES, range))
    return NextResponse.json(
      { error: "نماد یا بازه نامعتبر است." },
      { status: 400 },
    );
  const days = HISTORY_RANGES[range as HistoryRange],
    intraday = days <= 1,
    now = Date.now();
  try {
    const response = await fetch(
      intraday
        ? `https://www.tgju.org/profile/${symbol}`
        : `https://api.tgju.org/v1/market/indicator/summary-table-data/${symbol}?length=${Math.ceil(days * 1.5) + 10}`,
      {
        signal: AbortSignal.timeout(10000),
        next: { revalidate: intraday ? 60 : 900 },
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: intraday ? "text/html" : "application/json",
        },
      },
    );
    if (!response.ok) throw new Error("History upstream unavailable");
    const parsed = intraday
      ? parseIntradayHistory(await response.text(), now)
      : parseDailyHistory(await response.json(), now);
    const points = aggregateHistory(
      parsed.filter((p) => p.at >= now - days * 86400000),
    );
    return NextResponse.json(
      {
        symbol,
        range,
        source: "tgju",
        resolution: intraday ? "intraday" : "daily",
        unit: symbol === "ons" ? "usd" : "rial",
        fetchedAt: new Date(now).toISOString(),
        points,
      },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${intraday ? 60 : 900}, stale-while-revalidate=60`,
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "تاریخچهٔ منبع در دسترس نیست؛ دوباره تلاش کنید." },
      { status: 502 },
    );
  }
}
