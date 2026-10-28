"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Bell,
  ChartNoAxesCombined,
  Search,
  Star,
  LayoutGrid,
  List,
  ArrowUpDown,
} from "lucide-react";
import { CurrencyUnit, MarketItem } from "@/types/market";
import { formatPrice, formatPercent } from "@/lib/formatters";
import { PriceHistoryChart } from "@/components/charts/PriceHistoryChart";
import { readFavorites, toggleFavoriteSymbol } from "@/lib/favorites";

interface Props {
  items: MarketItem[];
  unit: CurrencyUnit;
  onSelectConverter: (symbol: string) => void;
  onOpenAlertModal: (symbol?: string) => void;
  searchQuery: string;
  macro?: unknown;
}

export function ForexView({
  items,
  unit,
  onSelectConverter,
  onOpenAlertModal,
  searchQuery,
}: Props) {
  const [region, setRegion] = useState("all"),
    [selected, setSelected] = useState("price_dollar_rl"),
    [sortBy, setSortBy] = useState<"default" | "gainers" | "losers">("default"),
    [viewMode, setViewMode] = useState<"grid" | "compact">("grid"),
    [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  const handleToggleFav = (symbol: string) => {
    setFavorites(toggleFavoriteSymbol(symbol));
  };

  const handleSelectChart = (symbol: string) => {
    setSelected(symbol);
    if (typeof window !== "undefined") {
      document
        .getElementById("market-chart-section")
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const filtered = useMemo(() => {
    const base = items.filter((item) => {
      const regionMatch =
        region === "all"
          ? true
          : region === "favorites"
            ? favorites.includes(item.symbol)
            : item.category === region;
      const queryMatch = `${item.title} ${item.titleEn} ${item.id} ${item.symbol}`
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
      return regionMatch && queryMatch;
    });

    if (sortBy === "gainers") {
      return [...base].sort((a, b) => b.changePercent - a.changePercent);
    }
    if (sortBy === "losers") {
      return [...base].sort((a, b) => a.changePercent - b.changePercent);
    }
    return base;
  }, [items, region, searchQuery, sortBy, favorites]);

  const chartItem = items.find((item) => item.symbol === selected) || items[0];

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      {/* Header & Summary */}
      <div className="flex flex-wrap justify-between items-end gap-2 min-w-0">
        <div className="min-w-0">
          <p className="text-bullion text-xs font-semibold mb-1">
            بازار ارز و اسکناس
          </p>
          <h1 className="font-black text-xl sm:text-3xl tracking-tight text-balance">
            قیمت‌ها، روشن و قابل پیگیری
          </h1>
          <p className="text-xs text-on-surface-variant mt-1.5">
            نرخ بازار آزاد از TGJU · نمایش دارایی‌های دارای دادهٔ زنده و تأییدشده
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-num shrink-0">
          <span>{filtered.length.toLocaleString("fa-IR")} دارایی فعال</span>
        </div>
      </div>

      {/* Filter Bar & Mobile View Mode Controls */}
      <div className="space-y-2.5 lg:space-y-0 lg:flex lg:items-center lg:justify-between gap-3 w-full min-w-0">
        <div
          className="flex flex-wrap gap-1.5 w-full lg:w-auto min-w-0"
          role="group"
          aria-label="فیلتر منطقه"
        >
          {[
            ["all", "همه ارزها"],
            ["favorites", "منتخب‌ها ★"],
            ["major", "ارزهای اصلی"],
            ["middle-east", "خاورمیانه"],
            ["cis-europe", "اروپا و همسایه‌ها"],
            ["east-asia", "شرق آسیا"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setRegion(id)}
              aria-pressed={region === id}
              className={`h-9 px-3 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                region === id
                  ? "gold-gradient-btn"
                  : "glass-panel text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sort & Layout Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full lg:w-auto min-w-0">
          <div
            className="flex items-center p-1 bg-obsidian-card rounded-xl border border-white/[0.08] min-w-0"
            role="group"
            aria-label="مرتب‌سازی"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-on-surface-variant mx-1.5 hidden sm:inline shrink-0" />
            {(
              [
                ["default", "پیش‌فرض"],
                ["gainers", "بیشترین رشد"],
                ["losers", "بیشترین افت"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSortBy(id)}
                aria-pressed={sortBy === id}
                className={`h-8 px-2.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
                  sortBy === id
                    ? "bg-bullion/20 text-bullion-light font-bold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div
            className="flex items-center p-1 bg-obsidian-card rounded-xl border border-white/[0.08] shrink-0"
            role="group"
            aria-label="حالت نمایش"
          >
            <button
              type="button"
              aria-label="نمایش کارتی"
              aria-pressed={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                viewMode === "grid"
                  ? "bg-bullion text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="نمایش فشرده موبایل"
              aria-pressed={viewMode === "compact"}
              onClick={() => setViewMode("compact")}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                viewMode === "compact"
                  ? "bg-bullion text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Asset Cards or Compact List */}
      {!filtered.length ? (
        <div
          role="status"
          className="glass-panel p-10 rounded-2xl text-center text-on-surface-variant"
        >
          <Search className="mx-auto mb-3 w-6 h-6" />
          ارزی با این مشخصات پیدا نشد.
        </div>
      ) : viewMode === "compact" ? (
        <div className="glass-panel rounded-2xl divide-y divide-white/[0.06] overflow-hidden w-full min-w-0">
          {filtered.map((item) => {
            const percent = formatPercent(item.changePercent);
            const isOunce = item.id === "ons";
            const isFav = favorites.includes(item.symbol);
            const isSelected = selected === item.symbol;
            return (
              <div
                key={item.id}
                className={`p-3 sm:px-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 transition-colors min-w-0 ${
                  isSelected ? "bg-bullion/10" : "hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    type="button"
                    aria-label={`افزودن ${item.title} به منتخب‌ها`}
                    onClick={() => handleToggleFav(item.symbol)}
                    className="h-8 w-8 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-bullion shrink-0"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        isFav ? "fill-bullion text-bullion" : ""
                      }`}
                    />
                  </button>
                  <div className="min-w-0">
                    <h2 className="font-bold text-sm text-on-surface truncate">
                      {item.title}
                    </h2>
                    <p className="text-[11px] text-on-surface-variant font-num mt-0.5">
                      {item.id.toUpperCase()} · {item.updatedAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-4 ms-auto shrink-0">
                  <div className="text-left" dir="ltr">
                    <p className="font-num text-sm sm:text-lg font-black text-bullion-light">
                      {formatPrice(item.priceToman, unit, false, isOunce)}
                    </p>
                    <span
                      className={`font-num text-[11px] font-semibold block ${
                        percent.isNeutral
                          ? "text-on-surface-variant"
                          : percent.isPositive
                            ? "text-gain-text"
                            : "text-loss-text"
                      }`}
                    >
                      {percent.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSelectChart(item.symbol)}
                      aria-label={`نمودار ${item.title}`}
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-obsidian-card border border-white/[0.06] text-bullion flex items-center justify-center"
                      title="مشاهده نمودار"
                    >
                      <ChartNoAxesCombined className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectConverter(item.symbol)}
                      aria-label={`تبدیل ${item.title}`}
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-obsidian-card border border-white/[0.06] text-on-surface-variant hover:text-on-surface flex items-center justify-center"
                      title="تبدیل ارز"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenAlertModal(item.symbol)}
                      aria-label={`هشدار قیمت ${item.title}`}
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-obsidian-card border border-white/[0.06] text-on-surface-variant hover:text-bullion flex items-center justify-center"
                      title="هشدار قیمت"
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 w-full min-w-0">
          {filtered.map((item) => {
            const percent = formatPercent(item.changePercent);
            const isOunce = item.id === "ons";
            const isFav = favorites.includes(item.symbol);
            const rangeSpan = Math.max(0.0001, item.highToman - item.lowToman);
            const rangePos =
              item.highToman > item.lowToman
                ? Math.min(
                    100,
                    Math.max(
                      5,
                      ((item.priceToman - item.lowToman) / rangeSpan) * 100,
                    ),
                  )
                : 50;

            return (
              <article
                key={item.id}
                className={`glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 min-w-0 transition-all ${
                  selected === item.symbol
                    ? "border-bullion/45 ring-1 ring-bullion/25"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start gap-2 min-w-0">
                  <div className="flex items-start gap-2 min-w-0">
                    <button
                      type="button"
                      aria-label={`افزودن ${item.title} به منتخب‌ها`}
                      onClick={() => handleToggleFav(item.symbol)}
                      className="mt-0.5 p-1 rounded-lg text-on-surface-variant hover:text-bullion transition-colors shrink-0"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isFav ? "fill-bullion text-bullion" : ""
                        }`}
                      />
                    </button>
                    <div className="min-w-0">
                      <h2 className="font-bold text-sm sm:text-base truncate">
                        {item.title}
                      </h2>
                      <p className="text-[11px] sm:text-xs text-on-surface-variant mt-0.5 font-num truncate">
                        {item.id.toUpperCase()} · {item.titleEn}
                        {item.dataQuality === "estimated" ? " · تخمینی" : ""}
                      </p>
                    </div>
                  </div>
                  <span
                    dir="ltr"
                    className={`font-num text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                      percent.isNeutral
                        ? "text-on-surface-variant bg-white/5"
                        : percent.isPositive
                          ? "text-gain-text bg-gain/15"
                          : "text-loss-text bg-loss/15"
                    }`}
                  >
                    {percent.text}
                  </span>
                </div>

                <p
                  className="font-num text-2xl sm:text-4xl font-black mt-4 mb-2 tracking-normal text-bullion-light truncate"
                  dir="ltr"
                >
                  {formatPrice(item.priceToman, unit, false, isOunce)}{" "}
                  <span className="text-xs font-medium text-on-surface-variant">
                    {isOunce ? "دلار" : unit === "rial" ? "ریال" : "تومان"}
                  </span>
                </p>

                {/* Intraday Low-to-High Range Bar */}
                <div className="mt-3.5 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center gap-2 text-[11px] text-on-surface-variant font-num mb-1.5 min-w-0">
                    <span className="truncate">
                      کمترین:{" "}
                      {formatPrice(item.lowToman, unit, false, isOunce)}
                    </span>
                    <span className="truncate">
                      بیشترین:{" "}
                      {formatPrice(item.highToman, unit, false, isOunce)}
                    </span>
                  </div>
                  <div
                    className="w-full h-1.5 bg-obsidian-950 rounded-full overflow-hidden"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full bg-gradient-to-l from-bullion-light to-bullion rounded-full"
                      style={{ width: `${rangePos}%` }}
                    />
                  </div>
                </div>

                <p className="text-[11px] mt-2.5 text-on-surface-variant font-num">
                  ساعت منبع: {item.updatedAt}
                </p>

                <div className="flex justify-between items-center gap-1.5 mt-3.5 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => onSelectConverter(item.symbol)}
                    className="h-9 px-2.5 rounded-xl text-xs font-medium flex gap-1.5 items-center text-bullion hover:bg-bullion/10 transition-colors whitespace-nowrap"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
                    تبدیل
                  </button>
                  <button
                    type="button"
                    disabled={item.dataQuality !== "live"}
                    onClick={() => handleSelectChart(item.symbol)}
                    className="h-9 px-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 hover:bg-white/5 transition-colors disabled:opacity-30 whitespace-nowrap"
                  >
                    <ChartNoAxesCombined className="w-3.5 h-3.5 text-bullion shrink-0" />
                    نمودار واقعی
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAlertModal(item.symbol)}
                    aria-label={`هشدار قیمت ${item.title}`}
                    className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors shrink-0"
                  >
                    <Bell className="w-4 h-4 text-on-surface-variant hover:text-bullion" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <PriceHistoryChart
        symbol={selected}
        title={chartItem?.title || "دلار آمریکا"}
        unit={unit}
      />

      <p className="text-xs text-on-surface-variant leading-7">
        نرخ‌های رسمی سنا و نیما از این منبع دریافت نمی‌شوند؛ برای جلوگیری از
        محاسبهٔ نادرست، نرخ ساختگی با ضریب ثابت نمایش داده نمی‌شود.
      </p>
    </div>
  );
}
