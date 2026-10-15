"use client";
import { useState } from "react";
import { MarketItem, CurrencyUnit } from "@/types/market";
import { formatPrice, formatPercent } from "@/lib/formatters";
import { PriceHistoryChart } from "@/components/charts/PriceHistoryChart";
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
  return (
    <div className="space-y-6">
      <div>
        <p className="text-bullion text-xs mb-2">دیده‌بان بازار</p>
        <h1 className="text-2xl font-black">روند واقعی هر دارایی</h1>
        <p className="text-xs text-on-surface-variant mt-3">
          نماد و بازه را انتخاب کنید؛ اعداد نمودار از تاریخچهٔ منبع دریافت
          می‌شوند.
        </p>
      </div>
      <label className="flex flex-wrap gap-3 items-center text-sm">
        انتخاب دارایی
        <select
          aria-label="دارایی نمودار"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="bg-obsidian-card rounded-xl border border-white/10 p-3 min-w-48"
        >
          {items.map((item) => (
            <option key={item.id} value={item.symbol}>
              {item.title}
            </option>
          ))}
        </select>
      </label>
      <PriceHistoryChart
        symbol={selected}
        title={
          items.find((item) => item.symbol === selected)?.title || "دلار آمریکا"
        }
        unit={unit}
      />
      <section className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex justify-between">
          <h2 className="font-bold">آخرین نرخ‌های دریافت‌شده</h2>
          <button
            onClick={() => onOpenAlertModal(selected)}
            className="text-xs text-bullion"
          >
            ثبت هشدار
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-right text-sm">
            <thead className="text-on-surface-variant text-xs">
              <tr>
                {["دارایی", "قیمت", "تغییر روزانه", "ساعت منبع", ""].map(
                  (label, i) => (
                    <th key={i} className="p-4">
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const pct = formatPercent(item.changePercent);
                return (
                  <tr key={item.id} className="border-t border-white/5">
                    <td className="p-4 font-bold">{item.title}</td>
                    <td className="p-4 font-num">
                      {formatPrice(
                        item.priceToman,
                        unit,
                        true,
                        item.id === "ons",
                      )}
                    </td>
                    <td
                      className={`p-4 font-num ${pct.isPositive ? "text-gain-text" : pct.isNeutral ? "text-on-surface-variant" : "text-loss-text"}`}
                      dir="ltr"
                    >
                      {pct.text}
                    </td>
                    <td className="p-4 font-num text-on-surface-variant">
                      {item.updatedAt}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => onSelectConverter(item.symbol)}
                        className="text-bullion text-xs"
                      >
                        تبدیل
                      </button>
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
