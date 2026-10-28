"use client";
import { useState } from "react";
import {
  ArrowLeftRight,
  Bell,
  ChartNoAxesCombined,
  Calculator,
  Sparkles,
} from "lucide-react";
import { MarketItem, CurrencyUnit } from "@/types/market";
import {
  formatPrice,
  formatPercent,
  parseLocalizedNumber,
  toPersianDigits,
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

  const handleSelectChart = (symbol: string) => {
    setSelected(symbol);
    if (typeof window !== "undefined") {
      document
        .getElementById("market-chart-section")
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

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

  const allGoldAndCoins = [...goldItems, ...coinItems];
  const chartTitle =
    allGoldAndCoins.find((i) => i.symbol === selected)?.title || "طلای ۱۸ عیار";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-end gap-3">
        <div>
          <p className="text-bullion text-xs font-semibold mb-1.5">
            طلا و مسکوکات
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-balance">
            ارزش امروز، روند روزهای گذشته
          </h1>
          <p className="text-xs text-on-surface-variant mt-2">
            پایش عیارهای طلا، مظنه مثقال، انس جهانی و حباب‌سنج تحلیلی مسکوکات
          </p>
        </div>
      </div>

      {/* Gold Benchmarks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {goldItems.map((item) => {
          const pct = formatPercent(item.changePercent);
          const isOunce = item.id === "ons";
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
              className={`glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between transition-all ${
                selected === item.symbol
                  ? "border-bullion/45 ring-1 ring-bullion/25"
                  : ""
              }`}
              key={item.id}
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h2 className="text-sm font-bold text-on-surface">
                      {item.title}
                    </h2>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 font-num">
                      {item.titleEn}
                    </p>
                  </div>
                  <span
                    dir="ltr"
                    className={`text-xs font-num font-bold px-2 py-1 rounded-lg ${
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

                <p className="font-num text-2xl sm:text-3xl mt-4 font-black text-bullion-light" dir="ltr">
                  {formatPrice(item.priceToman, unit, false, isOunce)}{" "}
                  <span className="text-xs font-medium text-on-surface-variant">
                    {isOunce ? "دلار" : unit === "rial" ? "ریال" : "تومان"}
                  </span>
                </p>

                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex justify-between text-[11px] text-on-surface-variant font-num mb-1.5">
                    <span>
                      کف: {formatPrice(item.lowToman, unit, false, isOunce)}
                    </span>
                    <span>
                      سقف: {formatPrice(item.highToman, unit, false, isOunce)}
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
              </div>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5 text-xs">
                <button
                  type="button"
                  onClick={() => onSelectConverter(item.symbol)}
                  className="min-h-[38px] px-2 rounded-lg text-on-surface-variant hover:text-bullion flex items-center gap-1"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  تبدیل
                </button>
                <button
                  type="button"
                  className="min-h-[38px] px-2.5 rounded-lg text-bullion font-semibold flex items-center gap-1 hover:bg-bullion/10 transition-colors"
                  onClick={() => handleSelectChart(item.symbol)}
                >
                  <ChartNoAxesCombined className="w-3.5 h-3.5" />
                  نمودار واقعی
                </button>
                <button
                  type="button"
                  aria-label={`هشدار قیمت ${item.title}`}
                  onClick={() => onOpenAlertModal(item.symbol)}
                  className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-on-surface-variant hover:text-bullion"
                >
                  <Bell className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Detailed Technical Chart */}
      <PriceHistoryChart symbol={selected} title={chartTitle} unit={unit} />

      {/* Gold Invoice & Making Fee Calculator */}
      <section className="glass-panel rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5 text-bullion" />
              برآورد فاکتور طلا
            </h2>
            <p className="text-xs text-on-surface-variant leading-6 mt-1">
              وزن و درصدهای درج‌شده در فاکتور فروشنده را وارد کنید. نرخ مالیات و
              سود به صورت خودکار فرض نمی‌شود.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setFields((f) => ({
                  ...f,
                  making: "0",
                  profit: "0",
                  tax: "0",
                }))
              }
              className="min-h-[34px] px-2.5 py-1 rounded-xl text-[11px] bg-obsidian-card hover:bg-obsidian-surface border border-white/[0.08] text-on-surface-variant hover:text-on-surface transition-colors"
            >
              طلای خام / بدون اجرت
            </button>
            <button
              type="button"
              onClick={() =>
                setFields((f) => ({
                  ...f,
                  making: "7",
                  profit: "7",
                  tax: "10",
                }))
              }
              className="min-h-[34px] px-2.5 py-1 rounded-xl text-[11px] bg-bullion/15 hover:bg-bullion/25 border border-bullion/30 text-bullion-light font-medium flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              اجرت ۷٪ + سود ۷٪ + مالیات ۱۰٪
            </button>
            <button
              type="button"
              onClick={() =>
                setFields((f) => ({
                  ...f,
                  making: "15",
                  profit: "7",
                  tax: "10",
                }))
              }
              className="min-h-[34px] px-2.5 py-1 rounded-xl text-[11px] bg-obsidian-card hover:bg-obsidian-surface border border-white/[0.08] text-on-surface-variant hover:text-on-surface transition-colors"
            >
              مدل پرکار (اجرت ۱۵٪)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                className="w-full mt-1.5 bg-obsidian-card rounded-xl border border-white/10 p-3 font-num text-sm focus:border-bullion focus:outline-none"
                dir="ltr"
              />
            </label>
          ))}
        </div>

        {/* Itemized Invoice Breakdown */}
        {valid && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/[0.06] text-xs">
            <div className="bg-obsidian-950/60 rounded-xl p-3 border border-white/[0.05]">
              <span className="text-on-surface-variant block">ارزش طلای خام</span>
              <span className="font-num font-bold text-on-surface mt-1 block">
                {formatPrice(raw, unit, true)}
              </span>
            </div>
            <div className="bg-obsidian-950/60 rounded-xl p-3 border border-white/[0.05]">
              <span className="text-on-surface-variant block">مبلغ اجرت ساخت</span>
              <span className="font-num font-bold text-on-surface mt-1 block">
                {formatPrice(fee, unit, true)}
              </span>
            </div>
            <div className="bg-obsidian-950/60 rounded-xl p-3 border border-white/[0.05]">
              <span className="text-on-surface-variant block">سود فروشنده</span>
              <span className="font-num font-bold text-on-surface mt-1 block">
                {formatPrice(seller, unit, true)}
              </span>
            </div>
            <div className="bg-obsidian-950/60 rounded-xl p-3 border border-white/[0.05]">
              <span className="text-on-surface-variant block">مالیات بر اجرت و سود</span>
              <span className="font-num font-bold text-on-surface mt-1 block">
                {formatPrice(vat, unit, true)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap justify-between items-center gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-bold">جمع برآوردی</span>
            <p className="w-full text-xs text-on-surface-variant mt-1">
              شامل ارزش طلای ۱۸ عیار، اجرت، سود و مالیات
            </p>
          </div>
          <output
            className="font-num text-2xl sm:text-3xl font-black text-bullion"
            aria-live="polite"
          >
            {valid ? formatPrice(total, unit, true) : "ورودی یا نرخ معتبر نیست"}
          </output>
        </div>
      </section>

      {/* Coins & Analytical Bubble Meter */}
      <section className="glass-panel rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap justify-between items-end gap-2 mb-5">
          <div>
            <h2 className="font-bold text-base sm:text-lg">
              قیمت سکه‌ها و حباب‌سنج تحلیلی
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              مقایسهٔ قیمت بازار هر مسکوک با ارزش ذاتی طلای به‌کاررفته در آن
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {coinItems.map((item) => {
            const pct = formatPercent(item.changePercent);
            const hasLiveBubble =
              gold?.dataQuality === "live" && item.dataQuality === "live";
            const bubblePct = item.bubblePercent ?? 0;
            const intrinsicShare = Math.max(
              10,
              Math.min(100, 100 - bubblePct),
            );

            return (
              <article
                key={item.id}
                className={`bg-obsidian-card/90 border border-white/[0.07] rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all ${
                  selected === item.symbol ? "ring-1 ring-bullion/40" : ""
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-on-surface">
                        {item.title}
                      </h3>
                      {item.weightGrams && (
                        <p className="text-[11px] text-on-surface-variant font-num mt-0.5">
                          وزن: {toPersianDigits(item.weightGrams)} گرم · عیار{" "}
                          {toPersianDigits(item.karat || 21.6)}
                        </p>
                      )}
                    </div>
                    <span
                      dir="ltr"
                      className={`text-xs font-num font-bold px-2 py-1 rounded-lg ${
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

                  <p className="font-num text-2xl font-black text-bullion-light my-4">
                    {formatPrice(item.priceToman, unit, true)}
                  </p>

                  {/* Analytical Bubble Breakdown */}
                  <div className="bg-obsidian-950/75 rounded-xl p-3 border border-white/[0.05] space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant">ارزش ذاتی طلا:</span>
                      <span className="font-num font-semibold text-on-surface">
                        {hasLiveBubble && item.intrinsicValueToman
                          ? formatPrice(item.intrinsicValueToman, unit, true)
                          : "ناموجود"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant">حباب برآوردی:</span>
                      <span className="font-num font-bold text-loss-text">
                        {hasLiveBubble
                          ? `${formatPrice(item.bubbleToman ?? 0, unit, true)} (${toPersianDigits(bubblePct.toFixed(1))}٪)`
                          : "ناموجود"}
                      </span>
                    </div>

                    {hasLiveBubble && (
                      <div className="pt-1">
                        <div
                          className="w-full h-2 rounded-full bg-loss/30 overflow-hidden flex"
                          aria-hidden="true"
                        >
                          <div
                            className="h-full bg-gain"
                            style={{ width: `${intrinsicShare}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-on-surface-variant mt-1 font-num">
                          <span className="text-gain-text">
                            ذاتی {toPersianDigits(intrinsicShare.toFixed(0))}٪
                          </span>
                          <span className="text-loss-text">
                            حباب {toPersianDigits(bubblePct.toFixed(1))}٪
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2 mt-4 pt-3 border-t border-white/5 text-xs">
                  <button
                    type="button"
                    onClick={() => onSelectConverter(item.symbol)}
                    className="min-h-[38px] px-2.5 rounded-lg text-on-surface-variant hover:text-bullion flex items-center gap-1"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    تبدیل
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAlertModal(item.symbol)}
                    className="min-h-[38px] px-2.5 rounded-lg text-on-surface-variant hover:text-bullion flex items-center gap-1"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    هشدار
                  </button>
                  <button
                    type="button"
                    className="min-h-[38px] px-2.5 rounded-lg text-bullion font-semibold flex items-center gap-1 hover:bg-bullion/10"
                    onClick={() => handleSelectChart(item.symbol)}
                  >
                    <ChartNoAxesCombined className="w-3.5 h-3.5" />
                    نمودار
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
