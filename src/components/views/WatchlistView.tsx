"use client";
import { useEffect, useState } from "react";
import { Star, Bell, ArrowLeftRight, ChartNoAxesCombined } from "lucide-react";
import { MarketItem, CurrencyUnit } from "@/types/market";
import { formatPrice, formatPercent } from "@/lib/formatters";
import { PriceHistoryChart } from "@/components/charts/PriceHistoryChart";
import { readFavorites, toggleFavoriteSymbol } from "@/lib/favorites";

interface Props {
  forexItems: MarketItem[];
  goldItems: MarketItem[];
  coinItems: MarketItem[];
  unit: CurrencyUnit;
  onSelectConverter: (symbol: string) => void;
  onOpenAlertModal: (symbol?: string) => void;
}

export function WatchlistView({
  forexItems,
  goldItems,
  coinItems,
  unit,
  onSelectConverter,
  onOpenAlertModal,
}: Props) {
  const items = [...forexItems, ...goldItems, ...coinItems].filter(
    (item) => item.dataQuality === "live",
  );
  const [selected, setSelected] = useState("price_dollar_rl");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  const handleToggleFav = (symbol: string) => {
    setFavorites(toggleFavoriteSymbol(symbol));
  };

  const displayedItems = onlyFavorites
    ? items.filter((i) => favorites.includes(i.symbol))
    : items;

  const selectedItem =
    items.find((item) => item.symbol === selected) || items[0];

  const selectAndScrollChart = (symbol: string) => {
    setSelected(symbol);
    if (typeof window !== "undefined") {
      document
        .getElementById("market-chart-section")
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <div className="flex flex-wrap justify-between items-end gap-3 min-w-0">
        <div className="min-w-0">
          <p className="text-bullion text-xs font-semibold mb-1">
            دیده‌بان بازار
          </p>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight">
            روند واقعی هر دارایی
          </h1>
          <p className="text-xs text-on-surface-variant mt-1.5">
            نماد و بازه را انتخاب کنید؛ اعداد نمودار مستقیماً از تاریخچهٔ منبع
            دریافت می‌شوند.
          </p>
        </div>

        <label className="flex flex-wrap gap-2 items-center text-xs sm:text-sm w-full sm:w-auto min-w-0">
          <span className="text-on-surface-variant">انتخاب دارایی:</span>
          <select
            aria-label="دارایی نمودار"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full sm:w-auto sm:min-w-52 bg-obsidian-card rounded-xl border border-white/10 px-3.5 py-2.5 font-semibold text-on-surface focus:border-bullion focus:outline-none"
          >
            {items.map((item) => (
              <option key={item.id} value={item.symbol}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Quick Asset Chips for Fast Mobile & Desktop Switching */}
      <div
        className="flex flex-wrap items-center gap-1.5 w-full min-w-0"
        role="group"
        aria-label="انتخاب سریع دارایی"
      >
        {items.slice(0, 10).map((item) => {
          const isActive = selected === item.symbol;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item.symbol)}
              aria-pressed={isActive}
              className={`h-8 sm:h-9 px-3 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "gold-gradient-btn"
                  : "bg-obsidian-card text-on-surface-variant hover:text-on-surface border border-white/[0.06]"
              }`}
            >
              {item.title}
            </button>
          );
        })}
      </div>

      <PriceHistoryChart
        symbol={selected}
        title={selectedItem?.title || "دلار آمریکا"}
        unit={unit}
      />

      <section className="glass-panel rounded-2xl overflow-hidden w-full min-w-0">
        <div className="p-3.5 sm:p-5 border-b border-white/5 flex flex-wrap justify-between items-center gap-2.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <h2 className="font-bold text-sm sm:text-base">
              آخرین نرخ‌های دریافت‌شده
            </h2>
            <button
              type="button"
              aria-pressed={onlyFavorites}
              onClick={() => setOnlyFavorites((v) => !v)}
              className={`h-8 px-2.5 rounded-xl text-xs border transition-colors whitespace-nowrap ${
                onlyFavorites
                  ? "bg-bullion/20 text-bullion-light border-bullion/40 font-bold"
                  : "bg-obsidian-card text-on-surface-variant border-white/[0.08]"
              }`}
            >
              فقط منتخب‌ها ★ ({favorites.length.toLocaleString("fa-IR")})
            </button>
          </div>
          <button
            type="button"
            onClick={() => onOpenAlertModal(selected)}
            className="h-9 px-3 rounded-xl bg-bullion/15 text-bullion-light border border-bullion/30 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Bell className="w-3.5 h-3.5 shrink-0" />
            ثبت هشدار
          </button>
        </div>

        {/* Mobile Native List View (< 768px) — Zero Horizontal Table Scroll */}
        <div className="md:hidden divide-y divide-white/[0.06]">
          {displayedItems.map((item) => {
            const pct = formatPercent(item.changePercent);
            const isOunce = item.id === "ons";
            const isFav = favorites.includes(item.symbol);
            const isCurrent = selected === item.symbol;
            return (
              <div
                key={item.id}
                className={`p-3.5 space-y-2.5 transition-colors ${
                  isCurrent ? "bg-bullion/10" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      aria-label={`منتخب ${item.title}`}
                      onClick={() => handleToggleFav(item.symbol)}
                      className="p-1 text-on-surface-variant hover:text-bullion shrink-0"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isFav ? "fill-bullion text-bullion" : ""
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => selectAndScrollChart(item.symbol)}
                      className="font-bold text-sm text-right text-on-surface hover:text-bullion truncate"
                    >
                      {item.title}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 shrink-0" dir="ltr">
                    <span className="font-num font-black text-sm text-bullion-light">
                      {formatPrice(item.priceToman, unit, true, isOunce)}
                    </span>
                    <span
                      className={`font-num text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                        pct.isPositive
                          ? "text-gain-text bg-gain/15"
                          : pct.isNeutral
                            ? "text-on-surface-variant bg-white/5"
                            : "text-loss-text bg-loss/15"
                      }`}
                    >
                      {pct.text}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px] text-on-surface-variant font-num">
                  <span className="truncate">
                    بازه: {formatPrice(item.lowToman, unit, false, isOunce)} تا{" "}
                    {formatPrice(item.highToman, unit, false, isOunce)}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => selectAndScrollChart(item.symbol)}
                      className="h-7 px-2 rounded-lg bg-obsidian-card border border-white/[0.06] text-bullion flex items-center gap-1"
                    >
                      <ChartNoAxesCombined className="w-3.5 h-3.5" />
                      <span>نمودار</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectConverter(item.symbol)}
                      className="h-7 px-2 rounded-lg bg-obsidian-card border border-white/[0.06] text-on-surface-variant flex items-center gap-1"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>تبدیل</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="text-on-surface-variant text-xs bg-obsidian-950/50">
              <tr>
                {[
                  "دارایی",
                  "قیمت",
                  "تغییر روزانه",
                  "بازهٔ روز (کف / سقف)",
                  "ساعت منبع",
                  "عملیات",
                ].map((label, i) => (
                  <th key={i} className="p-3.5 font-medium whitespace-nowrap">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedItems.map((item) => {
                const pct = formatPercent(item.changePercent);
                const isOunce = item.id === "ons";
                const isFav = favorites.includes(item.symbol);
                const isCurrent = selected === item.symbol;
                return (
                  <tr
                    key={item.id}
                    className={`border-t border-white/5 transition-colors ${
                      isCurrent ? "bg-bullion/10" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <td className="p-3.5 font-bold whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`منتخب ${item.title}`}
                          onClick={() => handleToggleFav(item.symbol)}
                          className="p-1 text-on-surface-variant hover:text-bullion"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              isFav ? "fill-bullion text-bullion" : ""
                            }`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelected(item.symbol)}
                          className="text-right hover:text-bullion transition-colors"
                        >
                          {item.title}
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5 font-num font-bold whitespace-nowrap">
                      {formatPrice(item.priceToman, unit, true, isOunce)}
                    </td>
                    <td
                      className={`p-3.5 font-num font-semibold whitespace-nowrap ${
                        pct.isPositive
                          ? "text-gain-text"
                          : pct.isNeutral
                            ? "text-on-surface-variant"
                            : "text-loss-text"
                      }`}
                      dir="ltr"
                    >
                      {pct.text}
                    </td>
                    <td className="p-3.5 font-num text-xs text-on-surface-variant whitespace-nowrap">
                      {formatPrice(item.lowToman, unit, false, isOunce)} تا{" "}
                      {formatPrice(item.highToman, unit, false, isOunce)}
                    </td>
                    <td className="p-3.5 font-num text-xs text-on-surface-variant whitespace-nowrap">
                      {item.updatedAt}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => selectAndScrollChart(item.symbol)}
                          className="px-2.5 py-1.5 rounded-lg bg-obsidian-card text-xs text-bullion flex items-center gap-1"
                        >
                          <ChartNoAxesCombined className="w-3.5 h-3.5" />
                          نمودار
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectConverter(item.symbol)}
                          className="px-2.5 py-1.5 rounded-lg bg-obsidian-card text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          تبدیل
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
