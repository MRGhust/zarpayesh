"use client";
import { useState } from "react";
import { MarketItem, CurrencyUnit } from "@/types/market";
import {
  formatPrice,
  formatPercent,
  parseLocalizedNumber,
} from "@/lib/formatters";
import { PriceHistoryChart } from "@/components/charts/PriceHistoryChart";
interface Props {
  goldItems: MarketItem[];
  coinItems: MarketItem[];
  unit: CurrencyUnit;
  onOpenAlertModal: (symbol?: string) => void;
  onSelectConverter: (symbol: string) => void;
}
export function GoldView({
  goldItems,
  coinItems,
  unit,
  onOpenAlertModal,
  onSelectConverter,
}: Props) {
  const [selected, setSelected] = useState("geram18");
  const [fields, setFields] = useState({
    weight: "1",
    making: "0",
    profit: "0",
    tax: "0",
  });
  const gold = goldItems.find((item) => item.id === "geram18"),
    weight = parseLocalizedNumber(fields.weight),
    making = parseLocalizedNumber(fields.making),
    profit = parseLocalizedNumber(fields.profit),
    tax = parseLocalizedNumber(fields.tax);
  const valid =
    [weight, making, profit, tax].every((v) => Number.isFinite(v) && v >= 0) &&
    weight > 0 &&
    [making, profit, tax].every((v) => v <= 100) &&
    gold?.dataQuality === "live";
  const raw = weight * (gold?.priceToman ?? 0),
    fee = (raw * making) / 100,
    seller = ((raw + fee) * profit) / 100,
    vat = ((fee + seller) * tax) / 100,
    total = raw + fee + seller + vat;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-bullion text-xs mb-2">طلا و مسکوکات</p>
        <h1 className="text-2xl font-black">ارزش امروز، روند روزهای گذشته</h1>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {goldItems.map((item) => {
          const pct = formatPercent(item.changePercent);
          return (
            <article className="glass-panel rounded-2xl p-5" key={item.id}>
              <h2 className="text-xs text-on-surface-variant">{item.title}</h2>
              <p className="font-num text-2xl mt-4 font-bold">
                {formatPrice(item.priceToman, unit, false, item.id === "ons")}
              </p>
              <p className="text-xs text-on-surface-variant mt-2">
                {item.id === "ons"
                  ? "دلار"
                  : unit === "rial"
                    ? "ریال"
                    : "تومان"}
              </p>
              <div className="flex justify-between mt-4">
                <span
                  dir="ltr"
                  className={`text-xs font-num ${pct.isPositive ? "text-gain-text" : "text-loss-text"}`}
                >
                  {pct.text}
                </span>
                <button
                  className="text-xs text-bullion"
                  onClick={() => setSelected(item.symbol)}
                >
                  نمودار واقعی
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <PriceHistoryChart
        symbol={selected}
        title={
          goldItems.find((i) => i.symbol === selected)?.title || "طلای ۱۸ عیار"
        }
        unit={unit}
      />
      <section className="glass-panel rounded-2xl p-5 sm:p-6">
        <h2 className="font-bold mb-2">برآورد فاکتور طلا</h2>
        <p className="text-xs text-on-surface-variant leading-7 mb-5">
          وزن و درصدهای درج‌شده در فاکتور فروشنده را وارد کنید. نرخ مالیات و سود
          به صورت خودکار فرض نمی‌شود.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(
            [
              ["weight", "وزن (گرم)"],
              ["making", "اجرت (درصد)"],
              ["profit", "سود (درصد)"],
              ["tax", "مالیات بر اجرت و سود (درصد)"],
            ] as const
          ).map(([key, label]) => (
            <label className="flex flex-col gap-1 text-xs" key={key}>
              {label}
              <input
                aria-label={label}
                inputMode="decimal"
                value={fields[key]}
                onChange={(e) =>
                  setFields((f) => ({ ...f, [key]: e.target.value }))
                }
                className="w-full mt-2 bg-obsidian-card rounded-xl border border-white/10 p-3 font-num"
                dir="ltr"
              />
            </label>
          ))}
        </div>
        <div className="mt-5 pt-5 border-t border-white/5 flex flex-wrap justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-sm">جمع برآوردی</span>
            <p className="w-full text-xs text-on-surface-variant mt-2 text-left">شامل اجرت، سود و مالیات</p>
          </div>
          <output className="font-num text-2xl text-bullion" aria-live="polite">
            {valid ? formatPrice(total, unit, true) : "ورودی یا نرخ معتبر نیست"}
          </output>
        </div>
      </section>
      <section className="glass-panel rounded-2xl p-5">
        <h2 className="font-bold mb-4">قیمت سکه‌ها</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {coinItems.map((item) => (
            <article key={item.id} className="bg-obsidian-card rounded-xl p-4">
              <h3 className="text-sm">{item.title}</h3>
              <p className="font-num text-xl text-bullion my-4">
                {formatPrice(item.priceToman, unit, true)}
              </p>
              <p className="text-xs text-on-surface-variant font-num bg-loss/10 text-loss-text px-2 py-1 rounded-md inline-block mt-2">
                حباب برآوردی:{" "}
                {gold?.dataQuality === "live" && item.dataQuality === "live"
                  ? formatPrice(item.bubbleToman ?? 0, unit, true)
                  : "ناموجود"}
              </p>
              <div className="flex gap-5 mt-4 text-xs">
                <button onClick={() => onSelectConverter(item.symbol)}>
                  تبدیل
                </button>
                <button onClick={() => onOpenAlertModal(item.symbol)}>
                  هشدار
                </button>
                <button
                  className="text-bullion"
                  onClick={() => setSelected(item.symbol)}
                >
                  نمودار
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
