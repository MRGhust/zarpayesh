import { NextRequest, NextResponse } from "next/server";
import {
  HISTORY_RANGES,
  HISTORY_SYMBOLS,
  HistoryPoint,
  HistoryRange,
  parseDailyHistory,
  parseIntradayHistory,
  aggregateHistory,
  computeHistoryStats,
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

  // Parsian 1g ingot tracks 18k gold on TGJU
  const upstreamSymbol = symbol === "parsian1g" ? "geram18" : symbol;
  const days = HISTORY_RANGES[range as HistoryRange],
    intraday = days <= 1,
    now = Date.now();
  try {
    let resolution: "intraday" | "daily" = intraday ? "intraday" : "daily";
    let parsed: HistoryPoint[] = [];

    if (intraday) {
      try {
        const response = await fetch(
          `https://www.tgju.org/profile/${upstreamSymbol}`,
          {
            signal: AbortSignal.timeout(10000),
            next: { revalidate: 60 },
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
              Accept: "text/html",
            },
          },
        );
        if (response.ok) {
          parsed = parseIntradayHistory(await response.text(), now);
        }
      } catch {
        parsed = [];
      }
    }

    // Filter relative to now first; if market is closed (e.g. evening/weekend in Tehran),
    // anchor to the latest trading session timestamp so 1H/1D charts remain populated with real data.
    let filtered = parsed.filter((p) => p.at >= now - days * 86400000);
    if (intraday && filtered.length < 2 && parsed.length >= 2) {
      const latestAt = parsed[parsed.length - 1].at;
      filtered = parsed.filter((p) => p.at >= latestAt - days * 86400000);
      if (filtered.length < 2) {
        filtered = parsed.slice(-Math.min(parsed.length, 30));
      }
    }

    // If intraday is unavailable or has fewer than 2 points, fall back to daily summary data
    if (!intraday || filtered.length < 2) {
      const fallbackDays = Math.max(days, 7);
      const response = await fetch(
        `https://api.tgju.org/v1/market/indicator/summary-table-data/${upstreamSymbol}?length=${Math.ceil(fallbackDays * 1.5) + 20}`,
        {
          signal: AbortSignal.timeout(10000),
          next: { revalidate: 900 },
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            Accept: "application/json",
          },
        },
      );
      if (!response.ok) throw new Error("History upstream unavailable");
      const dailyParsed = parseDailyHistory(await response.json(), now);
      let dailyFiltered = dailyParsed.filter(
        (p) => p.at >= now - fallbackDays * 86400000,
      );
      if (dailyFiltered.length < 2 && dailyParsed.length >= 2) {
        const latestAt = dailyParsed[dailyParsed.length - 1].at;
        dailyFiltered = dailyParsed.filter(
          (p) => p.at >= latestAt - fallbackDays * 86400000,
        );
        if (dailyFiltered.length < 2) {
          dailyFiltered = dailyParsed.slice(-Math.min(dailyParsed.length, 14));
        }
      }
      filtered = dailyFiltered;
      resolution = "daily";
    }

    const points = aggregateHistory(filtered);
    const stats = computeHistoryStats(points);

    return NextResponse.json(
      {
        symbol,
        range,
        source: "tgju",
        resolution,
        unit: symbol === "ons" ? "usd" : "rial",
        fetchedAt: new Date(now).toISOString(),
        points,
        stats,
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
