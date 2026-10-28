"use client";
import { useEffect, useId, useMemo, useState } from "react";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  LineChart,
  ChartCandlestick,
  BarChart3,
  Activity,
  Layers,
} from "lucide-react";
import { CurrencyUnit } from "@/types/market";
import {
  HistoryPoint,
  HistoryRange,
  computeHistoryStats,
} from "@/lib/history";
import { formatPrice, formatPercent, toPersianDigits } from "@/lib/formatters";

const RANGES: { id: HistoryRange; label: string }[] = [
  { id: "1H", label: "۱ ساعت" },
  { id: "1D", label: "۱ روز" },
  { id: "1W", label: "۱ هفته" },
  { id: "1M", label: "۱ ماه" },
  { id: "3M", label: "۳ ماه" },
  { id: "6M", label: "۶ ماه" },
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
    [kind, setKind] = useState<"line" | "candle" | "bar">("line"),
    [showSMA, setShowSMA] = useState(true),
    [showBands, setShowBands] = useState(false),
    [showExtremes, setShowExtremes] = useState(true);

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

  const points = useMemo(
    () => (data?.key === key ? data.points : []),
    [data, key],
  );
  const stats = useMemo(() => computeHistoryStats(points), [points]);

  // Compute Simple Moving Average (SMA-7) & Bollinger Bands (period 7, 1.8 stdDev)
  const indicators = useMemo(() => {
    const period = Math.min(7, Math.max(3, Math.floor(points.length / 4)));
    const sma: { at: number; value: number }[] = [];
    const upper: { at: number; value: number }[] = [];
    const lower: { at: number; value: number }[] = [];

    for (let i = 0; i < points.length; i++) {
      const start = Math.max(0, i - period + 1);
      const slice = points.slice(start, i + 1);
      const mean = slice.reduce((acc, p) => acc + p.price, 0) / slice.length;
      sma.push({ at: points[i].at, value: mean });

      if (slice.length >= 2) {
        const variance =
          slice.reduce((acc, p) => acc + (p.price - mean) ** 2, 0) /
          slice.length;
        const std = Math.sqrt(variance);
        upper.push({ at: points[i].at, value: mean + std * 1.8 });
        lower.push({ at: points[i].at, value: Math.max(0, mean - std * 1.8) });
      } else {
        upper.push({ at: points[i].at, value: mean });
        lower.push({ at: points[i].at, value: mean });
      }
    }
    return { sma, upper, lower };
  }, [points]);

  const values = points.flatMap((p, idx) => {
    const base =
      kind !== "line" ? [p.low ?? p.price, p.high ?? p.price] : [p.price];
    if (showBands && indicators.upper[idx] && indicators.lower[idx]) {
      base.push(indicators.upper[idx].value, indicators.lower[idx].value);
    }
    return base;
  });

  const lo = values.length ? Math.min(...values) : 0,
    hi = values.length ? Math.max(...values) : 1;
  const pad = (hi - lo) * 0.12 || Math.max(hi * 0.0001, 1),
    min = lo - pad,
    max = hi + pad;

  const svgWidth = 640,
    svgHeight = 310,
    plotLeft = 12,
    plotRight = 628,
    plotTop = 20,
    plotBottom = 234,
    histTop = 244,
    histBottom = 276;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  const x = (at: number) =>
    plotLeft +
    ((at - (points[0]?.at || 0)) /
      ((points.at(-1)?.at || 1) - (points[0]?.at || 0) || 1)) *
      plotW;
  const y = (price: number) =>
    plotBottom - ((price - min) / (max - min || 1)) * plotH;

  const isOunce = symbol === "ons";
  const unitLabel = isOunce ? "دلار" : unit === "rial" ? "ریال" : "تومان";

  const displayPrice = (value: number, withUnit = false) =>
    formatPrice(isOunce ? value : value / 10, unit, withUnit, isOunce);

  const date = (at: number, showTime = data?.resolution === "intraday") =>
    new Date(at).toLocaleString("fa-IR", {
      timeZone: "Asia/Tehran",
      month: "short",
      day: "numeric",
      ...(showTime
        ? { hour: "2-digit" as const, minute: "2-digit" as const }
        : {}),
    });

  const activeIdx = hover ?? points.length - 1;
  const selected = points[activeIdx];
  const prevPoint = activeIdx > 0 ? points[activeIdx - 1] : points[0];
  const selectedDeltaPct =
    selected && points[0] && points[0].price > 0
      ? ((selected.price - (points[0].open ?? points[0].price)) /
          (points[0].open ?? points[0].price)) *
        100
      : 0;
  const stepDeltaPct =
    selected && prevPoint && prevPoint.price > 0
      ? ((selected.price - prevPoint.price) / prevPoint.price) * 100
      : 0;

  const path = points
    .map(
      (p, i) => `${i ? "L" : "M"}${x(p.at).toFixed(1)},${y(p.price).toFixed(1)}`,
    )
    .join(" ");

  const smaPath = indicators.sma
    .map(
      (p, i) =>
        `${i ? "L" : "M"}${x(p.at).toFixed(1)},${y(p.value).toFixed(1)}`,
    )
    .join(" ");

  const bandPath =
    indicators.upper.length >= 2
      ? `${indicators.upper
          .map(
            (p, i) =>
              `${i ? "L" : "M"}${x(p.at).toFixed(1)},${y(p.value).toFixed(1)}`,
          )
          .join(" ")} ${[...indicators.lower]
          .reverse()
          .map((p) => `L${x(p.at).toFixed(1)},${y(p.value).toFixed(1)}`)
          .join(" ")} Z`
      : "";

  // Find High & Low point indices for on-chart callout pins
  const { maxIdx, minIdx, maxDelta } = useMemo(() => {
    let hiI = 0,
      loI = 0,
      mDelta = 0.0001;
    for (let i = 0; i < points.length; i++) {
      if (
        (points[i].high ?? points[i].price) >=
        (points[hiI].high ?? points[hiI].price)
      )
        hiI = i;
      if (
        (points[i].low ?? points[i].price) <=
        (points[loI].low ?? points[loI].price)
      )
        loI = i;
      if (i > 0) {
        const d = Math.abs(points[i].price - points[i - 1].price);
        if (d > mDelta) mDelta = d;
      }
    }
    return { maxIdx: hiI, minIdx: loI, maxDelta: mDelta };
  }, [points]);

  const isPositivePeriod = (stats?.changePercent ?? 0) >= 0;
  const strokeColor = isPositivePeriod ? "#fbbf24" : "#fb7185";

  return (
    <section
      id="market-chart-section"
      className="glass-panel rounded-2xl p-3.5 sm:p-6 w-full max-w-full min-w-0 overflow-hidden border border-white/[0.08]"
      aria-label={`نمودار تاریخی ${title}`}
    >
      {/* Top Header & Controls */}
      <div className="flex flex-wrap justify-between items-start gap-3 mb-3.5 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-sm sm:text-lg flex items-center gap-1.5 text-on-surface">
              {isPositivePeriod ? (
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-bullion shrink-0" />
              ) : (
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-loss-text shrink-0" />
              )}
              <span className="truncate">نمودار تکنیکال {title}</span>
            </h2>
            {stats && (
              <span
                dir="ltr"
                className={`font-num text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-lg border shrink-0 ${
                  stats.changePercent > 0
                    ? "bg-gain/15 text-gain-text border-gain/30"
                    : stats.changePercent < 0
                      ? "bg-loss/15 text-loss-text border-loss/30"
                      : "bg-white/5 text-on-surface-variant border-white/10"
                }`}
              >
                {formatPercent(stats.changePercent).text}
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-on-surface-variant mt-1">
            تاریخچهٔ واقعی TGJU • افق زمانی تهران • واحد نمایش: {unitLabel}
          </p>
        </div>

        {/* Chart Type & Refresh Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="flex items-center p-0.5 sm:p-1 bg-obsidian-950/90 rounded-xl border border-white/[0.07]"
            role="group"
            aria-label="نوع نمودار"
          >
            <button
              type="button"
              aria-label="نمودار خطی"
              aria-pressed={kind === "line"}
              onClick={() => setKind("line")}
              className={`h-8 sm:h-9 px-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                kind === "line"
                  ? "gold-gradient-btn"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <LineChart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">خطی</span>
            </button>
            <button
              type="button"
              aria-label="نمودار شمعی"
              aria-pressed={kind === "candle"}
              onClick={() => setKind("candle")}
              className={`h-8 sm:h-9 px-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                kind === "candle"
                  ? "gold-gradient-btn"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <ChartCandlestick className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">شمعی</span>
            </button>
            <button
              type="button"
              aria-label="نمودار میله‌ای OHLC"
              aria-pressed={kind === "bar"}
              onClick={() => setKind("bar")}
              className={`h-8 sm:h-9 px-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                kind === "bar"
                  ? "gold-gradient-btn"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">میله‌ای</span>
            </button>
          </div>

          <button
            type="button"
            aria-label="تازه‌سازی نمودار"
            onClick={() => setRetry((r) => r + 1)}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-obsidian-card hover:bg-obsidian-surface border border-white/[0.08] flex items-center justify-center text-on-surface-variant hover:text-bullion transition-colors shrink-0"
            title="بروزرسانی داده‌های نمودار"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin text-bullion" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Timeframe Selector & Technical Overlays Row */}
      <div className="space-y-2.5 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:justify-between gap-2 mb-3.5 pb-3 border-b border-white/[0.06] min-w-0">
        <div
          className="grid grid-cols-4 sm:flex sm:flex-wrap items-center gap-1.5 w-full sm:w-auto min-w-0"
          role="group"
          aria-label="بازهٔ زمانی نمودار"
        >
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={range === r.id}
              onClick={() => setRange(r.id)}
              className={`h-8 sm:h-9 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap flex items-center justify-center ${
                range === r.id
                  ? "gold-gradient-btn"
                  : "bg-obsidian-card text-on-surface-variant hover:text-on-surface border border-white/[0.05]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Technical Indicator Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs min-w-0">
          <button
            type="button"
            aria-pressed={showSMA}
            onClick={() => setShowSMA((v) => !v)}
            className={`h-8 px-2.5 rounded-lg border text-[11px] flex items-center gap-1 transition-colors whitespace-nowrap ${
              showSMA
                ? "bg-sky-500/15 text-sky-300 border-sky-400/40 font-semibold"
                : "bg-obsidian-card text-on-surface-variant border-white/[0.06]"
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span>میانگین متحرک (SMA)</span>
          </button>
          <button
            type="button"
            aria-pressed={showBands}
            onClick={() => setShowBands((v) => !v)}
            className={`h-8 px-2.5 rounded-lg border text-[11px] flex items-center gap-1 transition-colors whitespace-nowrap ${
              showBands
                ? "bg-purple-500/15 text-purple-300 border-purple-400/40 font-semibold"
                : "bg-obsidian-card text-on-surface-variant border-white/[0.06]"
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>کانال بولینگر</span>
          </button>
          <button
            type="button"
            aria-pressed={showExtremes}
            onClick={() => setShowExtremes((v) => !v)}
            className={`h-8 px-2.5 rounded-lg border text-[11px] transition-colors whitespace-nowrap ${
              showExtremes
                ? "bg-bullion/15 text-bullion-light border-bullion/40 font-semibold"
                : "bg-obsidian-card text-on-surface-variant border-white/[0.06]"
            }`}
          >
            خطوط سقف/کف
          </button>
        </div>
      </div>

      {/* Period Summary KPI Strip */}
      {stats && points.length >= 2 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mb-3.5">
          <div className="bg-obsidian-950/70 border border-white/[0.06] rounded-xl p-2.5 sm:p-3 min-w-0">
            <span className="text-[10px] sm:text-[11px] text-on-surface-variant block truncate">
              سقف بازه (High)
            </span>
            <span
              className="font-num text-xs sm:text-base font-bold text-gain-text mt-1 block truncate"
              dir="ltr"
            >
              {displayPrice(stats.high)}
            </span>
            <span className="text-[10px] text-on-surface-variant font-num mt-0.5 block truncate">
              {date(stats.highAt, false)}
            </span>
          </div>
          <div className="bg-obsidian-950/70 border border-white/[0.06] rounded-xl p-2.5 sm:p-3 min-w-0">
            <span className="text-[10px] sm:text-[11px] text-on-surface-variant block truncate">
              کف بازه (Low)
            </span>
            <span
              className="font-num text-xs sm:text-base font-bold text-loss-text mt-1 block truncate"
              dir="ltr"
            >
              {displayPrice(stats.low)}
            </span>
            <span className="text-[10px] text-on-surface-variant font-num mt-0.5 block truncate">
              {date(stats.lowAt, false)}
            </span>
          </div>
          <div className="bg-obsidian-950/70 border border-white/[0.06] rounded-xl p-2.5 sm:p-3 min-w-0">
            <span className="text-[10px] sm:text-[11px] text-on-surface-variant block truncate">
              میانگین بازه (Avg)
            </span>
            <span
              className="font-num text-xs sm:text-base font-bold text-bullion-light mt-1 block truncate"
              dir="ltr"
            >
              {displayPrice(stats.average)}
            </span>
            <span className="text-[10px] text-on-surface-variant font-num mt-0.5 block truncate">
              شروع: {displayPrice(stats.open)}
            </span>
          </div>
          <div className="bg-obsidian-950/70 border border-white/[0.06] rounded-xl p-2.5 sm:p-3 min-w-0">
            <span className="text-[10px] sm:text-[11px] text-on-surface-variant block truncate">
              دامنهٔ نوسان بازه
            </span>
            <span
              className="font-num text-xs sm:text-base font-bold text-on-surface mt-1 block truncate"
              dir="ltr"
            >
              {toPersianDigits(stats.volatilityPercent.toFixed(2))}٪
            </span>
            <span className="text-[10px] text-on-surface-variant font-num mt-0.5 block truncate">
              اختلاف: {displayPrice(stats.high - stats.low)}
            </span>
          </div>
        </div>
      )}

      <div className="min-w-0" aria-busy={loading}>
        {error ? (
          <div
            role="status"
            className="py-14 text-center text-sm text-loss-text"
          >
            {error}
            <button
              type="button"
              className="block mx-auto mt-4 px-4 py-2 rounded-xl bg-loss/15 border border-loss/30 text-loss-text hover:bg-loss/25 transition-colors"
              onClick={() => setRetry((r) => r + 1)}
            >
              تلاش مجدد
            </button>
          </div>
        ) : points.length < 2 ? (
          <p
            role="status"
            className="py-14 text-center text-sm text-on-surface-variant"
          >
            {loading
              ? "در حال دریافت تاریخچه…"
              : "در این بازه نمونهٔ کافی منتشر نشده است. بازهٔ یک هفته یا بیشتر را انتخاب کنید."}
          </p>
        ) : (
          <>
            {/* Active Sample Inspector Bar (Live Crosshair Readout) */}
            <div
              className="bg-obsidian-950/85 border border-white/[0.07] rounded-xl px-3 py-2.5 mb-3 flex flex-wrap items-center justify-between gap-2 text-xs min-w-0"
              aria-live="polite"
            >
              <div className="flex flex-wrap items-baseline gap-2 min-w-0">
                <span className="font-num text-lg sm:text-2xl font-black text-bullion">
                  {selected && displayPrice(selected.price)}
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  {unitLabel}
                </span>
                {selected && (
                  <span
                    dir="ltr"
                    className={`font-num text-[11px] sm:text-xs font-semibold ${
                      selectedDeltaPct > 0
                        ? "text-gain-text"
                        : selectedDeltaPct < 0
                          ? "text-loss-text"
                          : "text-on-surface-variant"
                    }`}
                  >
                    ({formatPercent(selectedDeltaPct).text} در بازه
                    {Math.abs(stepDeltaPct) >= 0.01
                      ? ` • ${formatPercent(stepDeltaPct).text} گام`
                      : ""}
                    )
                  </span>
                )}
              </div>

              {selected && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-num text-on-surface-variant min-w-0">
                  <span>
                    باز:{" "}
                    <strong className="text-on-surface">
                      {displayPrice(selected.open ?? selected.price)}
                    </strong>
                  </span>
                  <span>
                    سقف:{" "}
                    <strong className="text-gain-text">
                      {displayPrice(selected.high ?? selected.price)}
                    </strong>
                  </span>
                  <span>
                    کف:{" "}
                    <strong className="text-loss-text">
                      {displayPrice(selected.low ?? selected.price)}
                    </strong>
                  </span>
                  {showSMA && indicators.sma[activeIdx] && (
                    <span className="text-sky-300">
                      SMA:{" "}
                      <strong>
                        {displayPrice(indicators.sma[activeIdx].value)}
                      </strong>
                    </span>
                  )}
                  <span className="text-bullion-light font-semibold">
                    {date(selected.at, true)}
                  </span>
                </div>
              )}
            </div>

            {/* Interactive Technical SVG Canvas */}
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto block touch-pan-y select-none"
              role="img"
              aria-label={`${title}، ${toPersianDigits(points.length)} نمونهٔ واقعی`}
              onPointerLeave={() => setHover(null)}
              onPointerMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const target =
                  ((event.clientX - rect.left) / rect.width) * svgWidth;
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
                  <stop
                    offset="0%"
                    stopColor={strokeColor}
                    stopOpacity="0.28"
                  />
                  <stop
                    offset="75%"
                    stopColor={strokeColor}
                    stopOpacity="0.05"
                  />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Plot Background Frame */}
              <rect
                x={plotLeft}
                y={plotTop}
                width={plotW}
                height={plotH}
                rx="8"
                fill="#070d1f"
                fillOpacity="0.72"
                stroke="#1e293b"
                strokeWidth="1"
              />

              {/* Horizontal Price Grid Lines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const v = max - ((max - min) * i) / 4;
                const gy = y(v);
                return (
                  <line
                    key={`hgrid-${i}`}
                    x1={plotLeft}
                    x2={plotRight}
                    y1={gy}
                    y2={gy}
                    stroke="#1e293b"
                    strokeDasharray="4 5"
                  />
                );
              })}

              {/* Vertical Time Grid Lines & X-Axis Intermediate Labels */}
              {[0, 0.333, 0.667, 1].map((ratio, idx) => {
                const gx = plotLeft + plotW * ratio;
                const sampleIdx = Math.min(
                  points.length - 1,
                  Math.round((points.length - 1) * ratio),
                );
                const pt = points[sampleIdx];
                return (
                  <g key={`vgrid-${idx}`}>
                    <line
                      x1={gx}
                      x2={gx}
                      y1={plotTop}
                      y2={plotBottom}
                      stroke="#1e293b"
                      strokeOpacity="0.6"
                      strokeDasharray="3 5"
                    />
                    {pt && (
                      <text
                        x={
                          idx === 0
                            ? gx + 4
                            : idx === 3
                              ? gx - 4
                              : gx
                        }
                        y="300"
                        textAnchor={
                          idx === 0 ? "start" : idx === 3 ? "end" : "middle"
                        }
                        fill="#94a3b8"
                        fontSize="13"
                        className="font-num"
                      >
                        {date(pt.at)}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Bollinger Volatility Band */}
              {showBands && bandPath && (
                <>
                  <path
                    d={bandPath}
                    fill="#a855f7"
                    fillOpacity="0.1"
                    stroke="none"
                  />
                  <path
                    d={indicators.upper
                      .map(
                        (p, i) =>
                          `${i ? "L" : "M"}${x(p.at).toFixed(1)},${y(p.value).toFixed(1)}`,
                      )
                      .join(" ")}
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    strokeOpacity="0.65"
                  />
                  <path
                    d={indicators.lower
                      .map(
                        (p, i) =>
                          `${i ? "L" : "M"}${x(p.at).toFixed(1)},${y(p.value).toFixed(1)}`,
                      )
                      .join(" ")}
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    strokeOpacity="0.65"
                  />
                </>
              )}

              {/* Period Average, High & Low Reference Lines */}
              {showExtremes && stats && (
                <>
                  <line
                    x1={plotLeft}
                    x2={plotRight}
                    y1={y(stats.average)}
                    y2={y(stats.average)}
                    stroke="#f59e0b"
                    strokeOpacity="0.45"
                    strokeDasharray="6 4"
                  />
                  {stats.high > stats.low && (
                    <>
                      <line
                        x1={plotLeft}
                        x2={plotRight}
                        y1={y(stats.high)}
                        y2={y(stats.high)}
                        stroke="#34d399"
                        strokeOpacity="0.3"
                        strokeDasharray="2 4"
                      />
                      <line
                        x1={plotLeft}
                        x2={plotRight}
                        y1={y(stats.low)}
                        y2={y(stats.low)}
                        stroke="#fb7185"
                        strokeOpacity="0.3"
                        strokeDasharray="2 4"
                      />
                    </>
                  )}
                </>
              )}

              {/* Primary Price Series (Line / Candle / OHLC Bar) */}
              {kind === "line" ? (
                <>
                  <path
                    d={`${path} L${x(points.at(-1)!.at).toFixed(1)},${plotBottom} L${plotLeft},${plotBottom}Z`}
                    fill={`url(#${gradient})`}
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </>
              ) : kind === "candle" ? (
                points.map((p, i) => {
                  const openVal =
                    p.open ?? (i > 0 ? points[i - 1].price : p.price);
                  const up = p.price >= openVal,
                    color = up ? "#34d399" : "#fb7185",
                    width = Math.max(2, Math.min(13, 420 / points.length));
                  const highY = y(Math.max(p.high ?? p.price, openVal, p.price));
                  const lowY = y(Math.min(p.low ?? p.price, openVal, p.price));
                  const bodyTop = Math.min(y(openVal), y(p.price));
                  const bodyH = Math.max(2, Math.abs(y(openVal) - y(p.price)));
                  return (
                    <g key={p.at}>
                      <line
                        x1={x(p.at)}
                        x2={x(p.at)}
                        y1={highY}
                        y2={lowY}
                        stroke={color}
                        strokeWidth="1.2"
                      />
                      <rect
                        x={x(p.at) - width / 2}
                        y={bodyTop}
                        width={width}
                        height={bodyH}
                        rx="1"
                        fill={color}
                      />
                    </g>
                  );
                })
              ) : (
                points.map((p, i) => {
                  const openVal =
                    p.open ?? (i > 0 ? points[i - 1].price : p.price);
                  const up = p.price >= openVal,
                    color = up ? "#34d399" : "#fb7185",
                    tickW = Math.max(2, Math.min(7, 230 / points.length));
                  const px = x(p.at);
                  const highY = y(Math.max(p.high ?? p.price, openVal, p.price));
                  const lowY = y(Math.min(p.low ?? p.price, openVal, p.price));
                  return (
                    <g key={p.at}>
                      <line
                        x1={px}
                        x2={px}
                        y1={highY}
                        y2={lowY}
                        stroke={color}
                        strokeWidth="1.5"
                      />
                      <line
                        x1={px - tickW}
                        x2={px}
                        y1={y(openVal)}
                        y2={y(openVal)}
                        stroke={color}
                        strokeWidth="1.5"
                      />
                      <line
                        x1={px}
                        x2={px + tickW}
                        y1={y(p.price)}
                        y2={y(p.price)}
                        stroke={color}
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })
              )}

              {/* SMA Moving Average Curve */}
              {showSMA && smaPath && (
                <path
                  d={smaPath}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.7"
                  strokeDasharray="5 3"
                  vectorEffect="non-scaling-stroke"
                />
              )}

              {/* High & Low Extreme Pin Markers */}
              {showExtremes && hi > lo && points[maxIdx] && points[minIdx] && (
                <>
                  <circle
                    cx={x(points[maxIdx].at)}
                    cy={y(points[maxIdx].high ?? points[maxIdx].price)}
                    r="4"
                    fill="#10b981"
                    stroke="#040814"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={x(points[minIdx].at)}
                    cy={y(points[minIdx].low ?? points[minIdx].price)}
                    r="4"
                    fill="#f43f5e"
                    stroke="#040814"
                    strokeWidth="1.5"
                  />
                </>
              )}

              {/* In-Plot Crisp Y-Axis Price Labels (Prevents Left Margin Waste on Mobile) */}
              {[0, 1, 2, 3, 4].map((i) => {
                const v = max - ((max - min) * i) / 4;
                const gy = y(v);
                return (
                  <text
                    key={`ylabel-${i}`}
                    x={plotLeft + 6}
                    y={i === 0 ? gy + 13 : gy - 5}
                    textAnchor="start"
                    fill="#cbd5e1"
                    fontSize="12.5"
                    stroke="#040814"
                    strokeWidth="3"
                    paintOrder="stroke"
                    className="font-num font-semibold"
                    direction="ltr"
                  >
                    {displayPrice(v)}
                  </text>
                );
              })}

              {/* Bottom Sub-Panel: Step Momentum / Volatility Histogram */}
              <line
                x1={plotLeft}
                x2={plotRight}
                y1={histTop}
                y2={histTop}
                stroke="#1e293b"
                strokeWidth="1"
              />
              {points.map((p, i) => {
                const prev = i > 0 ? points[i - 1].price : p.open ?? p.price;
                const delta = p.price - prev;
                const barH = Math.max(
                  2,
                  (Math.abs(delta) / maxDelta) * (histBottom - histTop - 4),
                );
                const barW = Math.max(1.5, Math.min(9, 380 / points.length));
                const up = delta >= 0;
                return (
                  <rect
                    key={`hist-${p.at}`}
                    x={x(p.at) - barW / 2}
                    y={histBottom - barH}
                    width={barW}
                    height={barH}
                    rx="1"
                    fill={up ? "#34d399" : "#fb7185"}
                    fillOpacity={activeIdx === i ? "0.95" : "0.4"}
                  />
                );
              })}

              {/* 2D Crosshair & Active Sample Highlight */}
              {selected && (
                <>
                  <line
                    x1={x(selected.at)}
                    x2={x(selected.at)}
                    y1={plotTop}
                    y2={histBottom}
                    stroke="#fbbf24"
                    strokeOpacity="0.7"
                    strokeDasharray="3 4"
                  />
                  <line
                    x1={plotLeft}
                    x2={plotRight}
                    y1={y(selected.price)}
                    y2={y(selected.price)}
                    stroke="#fbbf24"
                    strokeOpacity="0.45"
                    strokeDasharray="3 4"
                  />
                  <circle
                    cx={x(selected.at)}
                    cy={y(selected.price)}
                    r="7"
                    fill="#fbbf24"
                    fillOpacity="0.22"
                  />
                  <circle
                    cx={x(selected.at)}
                    cy={y(selected.price)}
                    r="4"
                    fill="#fbbf24"
                    stroke="#040814"
                    strokeWidth="1.5"
                  />
                </>
              )}
            </svg>

            <label className="sr-only" htmlFor={`${gradient}-sample`}>
              بررسی نمونه‌های نمودار
            </label>
            <input
              id={`${gradient}-sample`}
              className="w-full accent-amber-400 mt-1 cursor-pointer"
              dir="ltr"
              type="range"
              min="0"
              max={points.length - 1}
              value={hover ?? points.length - 1}
              onChange={(e) => setHover(Number(e.target.value))}
            />

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-on-surface-variant mt-2 min-w-0">
              <p className="min-w-0 break-words">
                {toPersianDigits(points.length)} نمونه •{" "}
                {data?.resolution === "daily"
                  ? "قیمت پایانی روزانه؛ شمع‌ها از باز، سقف و کف واقعی"
                  : "داده‌های داخل روز؛ شمع‌ها از تجمیع نمونه‌های واقعی"}
                {hi === lo
                  ? " • منبع در این بازه تغییر قیمتی ثبت نکرده است."
                  : ""}
              </p>
              <div className="flex items-center gap-3 shrink-0">
                {showSMA && (
                  <span className="flex items-center gap-1 text-sky-300">
                    <span className="w-2.5 h-0.5 bg-sky-400 inline-block" />
                    میانگین متحرک
                  </span>
                )}
                {showExtremes && (
                  <span className="flex items-center gap-1 text-amber-300">
                    <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
                    خط میانگین بازه
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
