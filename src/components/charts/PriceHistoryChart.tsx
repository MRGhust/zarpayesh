"use client";
import { useEffect, useId, useState } from "react";
import {
  RefreshCw,
  TrendingUp,
  LineChart,
  ChartCandlestick,
} from "lucide-react";
import { CurrencyUnit } from "@/types/market";
import { HistoryPoint, HistoryRange } from "@/lib/history";
import { formatPrice, toPersianDigits } from "@/lib/formatters";
const RANGES: { id: HistoryRange; label: string }[] = [
  { id: "1H", label: "۱ ساعت" },
  { id: "1D", label: "۱ روز" },
  { id: "1W", label: "۱ هفته" },
  { id: "1M", label: "۱ ماه" },
  { id: "3M", label: "۳ ماه" },
  { id: "1Y", label: "۱ سال" },
];
export function PriceHistoryChart({
  symbol,
  title,
  unit,
}: {
  symbol: string;
  title: string;
  unit: CurrencyUnit;
}) {
  const [range, setRange] = useState<HistoryRange>("1W"),
    [kind, setKind] = useState<"line" | "candle">("line");
  const [data, setData] = useState<{
    key: string;
    points: HistoryPoint[];
    resolution: string;
  }>();
  const [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [retry, setRetry] = useState(0),
    [hover, setHover] = useState<number | null>(null);
  const key = `${symbol}:${range}`,
    gradient = useId().replaceAll(":", "");
  useEffect(() => {
    let disposed = false,
      controller: AbortController | undefined;
    async function load() {
      controller?.abort();
      controller = new AbortController();
      setLoading(true);
      setError("");
      setHover(null);
      try {
        const response = await fetch(
          `/api/history?symbol=${encodeURIComponent(symbol)}&range=${range}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("تاریخچه در دسترس نیست.");
        const result = await response.json();
        if (!Array.isArray(result.points))
          throw new Error("پاسخ تاریخچه معتبر نیست.");
        if (!disposed)
          setData({
            key,
            points: result.points,
            resolution: result.resolution,
          });
      } catch (e) {
        if (!disposed && !(e instanceof Error && e.name === "AbortError")) {
          setData(undefined);
          setError("دریافت تاریخچه ناموفق بود؛ دوباره تلاش کنید.");
        }
      } finally {
        if (!disposed) setLoading(false);
      }
    }
    void load();
    const interval = setInterval(load, 60000);
    return () => {
      disposed = true;
      controller?.abort();
      clearInterval(interval);
    };
  }, [symbol, range, key, retry]);
  const points = data?.key === key ? data.points : [];
  const values = points.flatMap((p) =>
    kind === "candle" ? [p.low ?? p.price, p.high ?? p.price] : [p.price],
  );
  const lo = values.length ? Math.min(...values) : 0,
    hi = values.length ? Math.max(...values) : 1;
  const pad = (hi - lo) * 0.08 || Math.max(hi * 0.0001, 1),
    min = lo - pad,
    max = hi + pad;
  const x = (at: number) =>
    92 +
    ((at - (points[0]?.at || 0)) /
      ((points.at(-1)?.at || 1) - (points[0]?.at || 0) || 1)) *
      680;
  const y = (price: number) => 270 - ((price - min) / (max - min)) * 240;
  const displayPrice = (value: number) =>
    formatPrice(
      symbol === "ons" ? value : value / 10,
      unit,
      false,
      symbol === "ons",
    );
  const date = (at: number) =>
    new Date(at).toLocaleString("fa-IR", {
      timeZone: "Asia/Tehran",
      month: "short",
      day: "numeric",
      ...(data?.resolution === "intraday"
        ? { hour: "2-digit" as const, minute: "2-digit" as const }
        : {}),
    });
  const selected = points[hover ?? points.length - 1];
  const path = points
    .map((p, i) => `${i ? "L" : "M"}${x(p.at)},${y(p.price)}`)
    .join(" ");
  return (
    <section
      className="glass-panel rounded-2xl p-4 sm:p-6 min-w-0"
      aria-label={`نمودار تاریخی ${title}`}
    >
      <div className="flex flex-wrap justify-between gap-4 mb-5">
        <div>
          <h2 className="font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-bullion" />
            {title}
          </h2>
          <p className="text-xs text-on-surface-variant mt-2">
            تاریخچهٔ واقعی TGJU • زمان تهران •{" "}
            {symbol === "ons" ? "دلار" : unit === "rial" ? "ریال" : "تومان"}
          </p>
        </div>
        <div className="flex gap-1 items-center" aria-label="نوع نمودار">
          <button
            aria-label="نمودار خطی"
            aria-pressed={kind === "line"}
            onClick={() => setKind("line")}
            className={`p-2 rounded-lg ${kind === "line" ? "gold-gradient-btn" : "bg-obsidian-card"}`}
          >
            <LineChart className="w-4 h-4" />
          </button>
          <button
            aria-label="نمودار شمعی"
            aria-pressed={kind === "candle"}
            onClick={() => setKind("candle")}
            className={`p-2 rounded-lg ${kind === "candle" ? "gold-gradient-btn" : "bg-obsidian-card"}`}
          >
            <ChartCandlestick className="w-4 h-4" />
          </button>
          <button
            aria-label="تازه‌سازی نمودار"
            onClick={() => setRetry((r) => r + 1)}
            className="p-2 rounded-lg bg-obsidian-card"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {RANGES.map((r) => (
          <button
            key={r.id}
            aria-pressed={range === r.id}
            onClick={() => setRange(r.id)}
            className={`px-3 py-2 rounded-xl text-xs ${range === r.id ? "gold-gradient-btn" : "bg-obsidian-card text-on-surface-variant hover:text-on-surface"}`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="min-h-72" aria-busy={loading}>
        {error ? (
          <div
            role="status"
            className="py-20 text-center text-sm text-loss-text"
          >
            {error}
            <button
              className="block mx-auto mt-4 underline"
              onClick={() => setRetry((r) => r + 1)}
            >
              تلاش مجدد
            </button>
          </div>
        ) : points.length < 2 ? (
          <p
            role="status"
            className="py-20 text-center text-sm text-on-surface-variant"
          >
            {loading
              ? "در حال دریافت تاریخچه…"
              : "در این بازه نمونهٔ کافی منتشر نشده است. بازهٔ یک هفته یا بیشتر را انتخاب کنید."}
          </p>
        ) : (
          <>
            <div
              className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3 min-h-8"
              aria-live="polite"
            >
              <span className="font-num text-xl text-bullion">
                {selected && displayPrice(selected.price)}
              </span>
              <span className="font-num text-on-surface-variant">
                {selected && date(selected.at)}
              </span>
            </div>
            <svg
              viewBox="0 0 800 310"
              className="w-full h-auto touch-pan-y"
              role="img"
              aria-label={`${title}، ${toPersianDigits(points.length)} نمونهٔ واقعی`}
              onPointerLeave={() => setHover(null)}
              onPointerMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const target = ((event.clientX - rect.left) / rect.width) * 800;
                let closest = 0;
                for (let i = 1; i < points.length; i++)
                  if (
                    Math.abs(x(points[i].at) - target) <
                    Math.abs(x(points[closest].at) - target)
                  )
                    closest = i;
                setHover(closest);
              }}
            >
              <defs>
                <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#f59e0b" stopOpacity=".22" />
                  <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3, 4].map((i) => {
                const v = max - ((max - min) * i) / 4;
                return (
                  <g key={i}>
                    <line
                      x1="92"
                      x2="772"
                      y1={y(v)}
                      y2={y(v)}
                      stroke="#263149"
                      strokeDasharray="4 5"
                    />
                    <text
                      x="80"
                      y={y(v) + 4}
                      textAnchor="end"
                      fill="#94a3b8"
                      fontSize="16"
                      className="font-num"
                      direction="ltr"
                    >
                      {displayPrice(v)}
                    </text>
                  </g>
                );
              })}
              {kind === "line" ? (
                <>
                  <path
                    d={`${path} L${x(points.at(-1)!.at)},270 L92,270Z`}
                    fill={`url(#${gradient})`}
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </>
              ) : (
                points.map((p, i) => {
                  const up = p.price >= (p.open ?? p.price),
                    color = up ? "#34d399" : "#fb7185",
                    width = Math.max(1, Math.min(14, 500 / points.length));
                  return (
                    <g key={p.at}>
                      <line
                        x1={x(p.at)}
                        x2={x(p.at)}
                        y1={y(p.high ?? p.price)}
                        y2={y(p.low ?? p.price)}
                        stroke={color}
                      />
                      <rect
                        x={x(p.at) - width / 2}
                        y={Math.min(y(p.open ?? p.price), y(p.price))}
                        width={width}
                        height={Math.max(
                          1,
                          Math.abs(y(p.open ?? p.price) - y(p.price)),
                        )}
                        fill={color}
                      />
                    </g>
                  );
                })
              )}
              {selected && (
                <>
                  <line
                    x1={x(selected.at)}
                    x2={x(selected.at)}
                    y1="30"
                    y2="270"
                    stroke="#94a3b8"
                    strokeDasharray="3 5"
                  />
                  <circle
                    cx={x(selected.at)}
                    cy={y(selected.price)}
                    r="4"
                    fill="#fbbf24"
                  />
                </>
              )}
              <text
                x="92"
                y="303"
                textAnchor="start"
                fill="#94a3b8"
                fontSize="16"
                className="font-num"
              >
                {date(points[0].at)}
              </text>
              <text
                x="772"
                y="303"
                textAnchor="end"
                fill="#94a3b8"
                fontSize="16"
                className="font-num"
              >
                {date(points.at(-1)!.at)}
              </text>
            </svg>
            <label className="sr-only" htmlFor={`${gradient}-sample`}>
              بررسی نمونه‌های نمودار
            </label>
            <input
              id={`${gradient}-sample`}
              className="w-full accent-amber-400"
              dir="ltr"
              type="range"
              min="0"
              max={points.length - 1}
              value={hover ?? points.length - 1}
              onChange={(e) => setHover(Number(e.target.value))}
            />
            <p className="text-[11px] text-on-surface-variant mt-2">
              {toPersianDigits(points.length)} نمونه •{" "}
              {data?.resolution === "daily"
                ? "قیمت پایانی روزانه؛ شمع‌ها از باز، سقف و کف واقعی"
                : "داده‌های داخل روز؛ شمع‌ها از تجمیع نمونه‌های واقعی"}
              {hi === lo
                ? " • منبع در این بازه تغییر قیمتی ثبت نکرده است."
                : ""}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
