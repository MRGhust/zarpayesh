"use client";
import { useEffect, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { CurrencyUnit, MarketItem } from "@/types/market";
import { formatPrice, parseLocalizedNumber } from "@/lib/formatters";
interface Props {
  forexItems: MarketItem[];
  goldItems: MarketItem[];
  coinItems: MarketItem[];
  unit: CurrencyUnit;
  initialSymbol?: string;
}
export function ConverterView({
  forexItems,
  goldItems,
  coinItems,
  unit,
  initialSymbol = "price_dollar_rl",
}: Props) {
  const items = [...forexItems, ...goldItems, ...coinItems].filter(
    (item) => item.dataQuality === "live",
  );
  const [source, setSource] = useState(initialSymbol),
    [target, setTarget] = useState("toman"),
    [input, setInput] = useState("100");
  useEffect(() => {
    setSource(initialSymbol);
  }, [initialSymbol]);
  const dollar = items.find((item) => item.id === "usd");
  const rate = (code: string): number => {
    if (code === "toman") return 10;
    if (code === "rial") return 1;
    const item = items.find((item) => item.symbol === code);
    if (!item) return NaN;
    return item.id === "ons"
      ? item.priceRial * (dollar?.priceRial ?? NaN)
      : item.priceRial;
  };
  const amount = parseLocalizedNumber(input),
    sourceRate = rate(source),
    targetRate = rate(target);
  const result = (amount * sourceRate) / targetRate,
    valid = Number.isFinite(result) && amount >= 0 && targetRate > 0;
  const options = [
    { id: "toman", title: "تومان" },
    { id: "rial", title: "ریال" },
    ...items.map((item) => ({ id: item.symbol, title: item.title })),
  ];
  const resultLabel = options.find((item) => item.id === target)?.title || "";
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-bullion text-xs mb-2">مبدل زرپایش</p>
        <h1 className="text-2xl sm:text-3xl font-black">
          تبدیل با نرخ واقعی بازار
        </h1>
        <p className="text-xs text-on-surface-variant leading-7 mt-3">
          فقط دارایی‌های دارای نرخ تأییدشده؛ بدون ضریب فرضی سنا و نیما.
        </p>
      </div>
      <section className="glass-panel p-5 sm:p-8 rounded-3xl space-y-6">
        <label className="block text-sm">
          مقدار
          <input
            aria-label="مقدار تبدیل"
            inputMode="decimal"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="block w-full bg-obsidian-950 border border-white/10 rounded-2xl p-4 mt-3 text-3xl font-num"
            dir="ltr"
          />
        </label>
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 sm:gap-4">
          <label className="min-w-0 text-xs sm:text-sm">
            از
            <select
              aria-label="واحد مبدأ"
              className="w-full p-3 bg-obsidian-card border border-white/10 rounded-xl mt-2"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
          </label>
          <button
            aria-label="جابجایی مبدأ و مقصد"
            onClick={() => {
              setSource(target);
              setTarget(source);
            }}
            className="gold-gradient-btn p-3 rounded-xl hover:scale-110 active:scale-95 transition-transform duration-200"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
          <label className="min-w-0 text-xs sm:text-sm">
            به
            <select
              aria-label="واحد مقصد"
              className="w-full p-3 bg-obsidian-card border border-white/10 rounded-xl mt-2"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div
          className="rounded-2xl bg-bullion/5 border border-bullion/20 p-5"
          aria-live="polite"
        >
          <p className="text-xs text-on-surface-variant mb-3">مقدار معادل</p>
          <output className="font-num text-5xl font-black text-bullion drop-shadow-md break-words">
            {valid
              ? result.toLocaleString("fa-IR", {
                  maximumFractionDigits:
                    target === "toman" || target === "rial" ? 0 : 6,
                })
              : "—"}
          </output>
          <p className="text-sm mt-2">{resultLabel}</p>
          {!valid && (
            <p className="text-xs text-loss-text mt-3">
              عدد معتبر و نامنفی وارد کنید؛ هر دو دارایی باید نرخ موجود داشته
              باشند.
            </p>
          )}
        </div>
      </section>
      <section className="glass-panel rounded-2xl p-5">
        <h2 className="font-bold text-sm mb-4">معادل در دارایی‌های دیگر</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((item) => {
            const converted = (amount * sourceRate) / rate(item.symbol);
            return (
              <div
                key={item.id}
                className="flex justify-between gap-3 py-3 border-b border-white/5 text-xs"
              >
                <span>{item.title}</span>
                <span className="font-num">
                  {Number.isFinite(converted) && amount >= 0
                    ? converted.toLocaleString("fa-IR", {
                        maximumFractionDigits: 4,
                      })
                    : "—"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-on-surface-variant mt-4 leading-7">
          انس جهانی با نرخ دلارِ دریافت‌شده به ریال تبدیل می‌شود. نتیجه برآورد
          ارزش بازار است و کارمزد خرید و فروش را شامل نمی‌شود.
        </p>
      </section>
    </div>
  );
}
