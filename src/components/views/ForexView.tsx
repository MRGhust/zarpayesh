"use client";
import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Bell,
  ChartNoAxesCombined,
  Search,
} from "lucide-react";
import { CurrencyUnit, MarketItem } from "@/types/market";
import { formatPrice, formatPercent } from "@/lib/formatters";
import { PriceHistoryChart } from "@/components/charts/PriceHistoryChart";
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
    [selected, setSelected] = useState("price_dollar_rl");
  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (region === "all" || item.category === region) &&
          `${item.title} ${item.titleEn} ${item.id} ${item.symbol}`
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase()),
      ),
    [items, region, searchQuery],
  );
  const chartItem = items.find((item) => item.symbol === selected);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-end gap-3">
        <div>
          <p className="text-bullion text-xs mb-2">بازار ارز</p>
          <h1 className="font-black text-2xl sm:text-3xl">
            قیمت‌ها، روشن و قابل پیگیری
          </h1>
          <p className="text-xs text-on-surface-variant mt-3">
            نرخ بازار آزاد از TGJU؛ نمایش دارایی‌های دارای دادهٔ معتبر.
          </p>
        </div>
        <span className="text-xs text-on-surface-variant font-num">
          {items.length.toLocaleString("fa-IR")} ارز
        </span>
      </div>
      <div className="flex gap-2 flex-wrap" aria-label="فیلتر منطقه">
        {[
          ["all", "همه ارزها"],
          ["major", "ارزهای اصلی"],
          ["middle-east", "خاورمیانه"],
          ["cis-europe", "اروپا و همسایه‌ها"],
          ["east-asia", "شرق آسیا"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setRegion(id)}
            aria-pressed={region === id}
            className={`px-4 py-2.5 rounded-xl text-xs ${region === id ? "gold-gradient-btn" : "glass-panel text-on-surface-variant"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {!filtered.length ? (
        <div
          role="status"
          className="glass-panel p-10 rounded-2xl text-center text-on-surface-variant"
        >
          <Search className="mx-auto mb-3 w-6 h-6" />
          ارزی با این مشخصات پیدا نشد.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const percent = formatPercent(item.changePercent);
            return (
              <article
                key={item.id}
                className={`glass-panel rounded-2xl p-5 min-w-0 ${selected === item.symbol ? "border-amber-400/40" : ""}`}
              >
                <div className="flex justify-between gap-2">
                  <div>
                    <h2 className="font-bold text-sm">{item.title}</h2>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {item.id.toUpperCase()}{" "}
                      {item.dataQuality === "estimated" ? "• تخمینی" : ""}
                    </p>
                  </div>
                  <span
                    dir="ltr"
                    className={`font-num text-xs px-2 py-1 bg-white/5 rounded-md backdrop-blur-sm ${percent.isNeutral ? "text-on-surface-variant" : percent.isPositive ? "text-gain-text" : "text-loss-text"}`}
                  >
                    {percent.text}
                  </span>
                </div>
                <p
                  className="font-num text-3xl sm:text-4xl font-black mt-6 mb-2 tracking-normal text-bullion-light"
                  dir="ltr"
                >
                  {formatPrice(item.priceToman, unit, false, item.id === "ons")}{" "}
                  <span className="text-xs font-medium text-on-surface-variant">
                    {item.id === "ons"
                      ? "دلار"
                      : unit === "rial"
                        ? "ریال"
                        : "تومان"}
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-white/10 text-xs text-on-surface-variant font-num">
                  <span>
                    کمترین:{" "}
                    {formatPrice(item.lowToman, unit, false, item.id === "ons")}
                  </span>
                  <span>
                    بیشترین:{" "}
                    {formatPrice(
                      item.highToman,
                      unit,
                      false,
                      item.id === "ons",
                    )}
                  </span>
                </div>
                <p className="text-[11px] mt-3 text-on-surface-variant font-num">
                  ساعت منبع: {item.updatedAt}
                </p>
                <div className="flex justify-between gap-2 mt-4 pt-4 border-t border-white/5">
                  <button
                    onClick={() => onSelectConverter(item.symbol)}
                    className="text-xs flex gap-1 items-center text-bullion"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    تبدیل
                  </button>
                  <button
                    disabled={item.dataQuality !== "live"}
                    onClick={() => setSelected(item.symbol)}
                    className="text-xs flex items-center gap-1 disabled:opacity-30"
                  >
                    <ChartNoAxesCombined className="w-4 h-4" />
                    نمودار واقعی
                  </button>
                  <button
                    onClick={() => onOpenAlertModal(item.symbol)}
                    aria-label={`هشدار قیمت ${item.title}`}
                  >
                    <Bell className="w-4 h-4 text-on-surface-variant" />
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
