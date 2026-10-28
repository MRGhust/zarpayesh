"use client";
import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  Copy,
  Check,
  Briefcase,
  Plus,
  Trash2,
} from "lucide-react";
import { CurrencyUnit, MarketItem } from "@/types/market";
import {
  formatPrice,
  parseLocalizedNumber,
  toPersianDigits,
} from "@/lib/formatters";

interface PortfolioHolding {
  id: string;
  symbol: string;
  amount: number;
}

const PORTFOLIO_KEY = "zarpayesh.portfolio.v1";

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
    [input, setInput] = useState("100"),
    [copied, setCopied] = useState(false);

  // Personal Portfolio State
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [newHoldSymbol, setNewHoldSymbol] = useState("price_dollar_rl");
  const [newHoldAmount, setNewHoldAmount] = useState("");

  useEffect(() => {
    setSource(initialSymbol);
  }, [initialSymbol]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PORTFOLIO_KEY) || "[]");
      if (Array.isArray(saved)) setHoldings(saved);
    } catch {}
  }, []);

  const saveHoldings = (next: PortfolioHolding[]) => {
    setHoldings(next);
    try {
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(next));
    } catch {}
  };

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
  const unitCrossRate = sourceRate / targetRate;

  const options = [
    { id: "toman", title: "تومان" },
    { id: "rial", title: "ریال" },
    ...items.map((item) => ({ id: item.symbol, title: item.title })),
  ];
  const sourceLabel = options.find((item) => item.id === source)?.title || "";
  const resultLabel = options.find((item) => item.id === target)?.title || "";

  const totalPortfolioRial = holdings.reduce((sum, h) => {
    const r = rate(h.symbol);
    return Number.isFinite(r) ? sum + h.amount * r : sum;
  }, 0);

  return (
    <div className="max-w-4xl mx-auto w-full min-w-0 space-y-5 sm:space-y-6">
      <div className="min-w-0">
        <p className="text-bullion text-xs font-semibold mb-1">
          مبدل و سبد دارایی زرپایش
        </p>
        <h1 className="text-xl sm:text-3xl font-black tracking-tight">
          تبدیل با نرخ واقعی بازار
        </h1>
        <p className="text-xs text-on-surface-variant leading-6 mt-1.5">
          فقط دارایی‌های دارای نرخ تأییدشده؛ بدون ضریب فرضی سنا و نیما.
        </p>
      </div>

      <section className="glass-panel p-4 sm:p-8 rounded-3xl space-y-5 sm:space-y-6 w-full min-w-0">
        <div className="min-w-0">
          <label className="block text-sm font-semibold min-w-0">
            مقدار
            <input
              aria-label="مقدار تبدیل"
              inputMode="decimal"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="block w-full bg-obsidian-950 border border-white/10 rounded-2xl p-3.5 sm:p-4 mt-2 text-xl sm:text-3xl font-num focus:border-bullion focus:outline-none"
              dir="ltr"
            />
          </label>

          {/* Quick Amount Chips for One-Tap Mobile Input */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {[
              ["1", "۱"],
              ["10", "۱۰"],
              ["100", "۱۰۰"],
              ["1000", "۱٬۰۰۰"],
              ["10000000", "۱۰ میلیون"],
              ["100000000", "۱۰۰ میلیون"],
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setInput(val)}
                className={`h-8 px-3 rounded-xl text-xs font-num border transition-colors ${
                  input === val
                    ? "bg-bullion/20 text-bullion-light border-bullion/40 font-bold"
                    : "bg-obsidian-card text-on-surface-variant border-white/[0.06] hover:text-on-surface"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-end gap-3 sm:gap-4 min-w-0">
          <label className="min-w-0 text-xs sm:text-sm font-medium">
            از
            <select
              aria-label="واحد مبدأ"
              className="w-full p-3 sm:p-3.5 bg-obsidian-card border border-white/10 rounded-xl mt-1.5 text-sm font-semibold truncate"
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
            type="button"
            aria-label="جابجایی مبدأ و مقصد"
            onClick={() => {
              setSource(target);
              setTarget(source);
            }}
            className="h-11 w-11 gold-gradient-btn p-2.5 rounded-xl flex items-center justify-center mx-auto hover:scale-105 active:scale-95 transition-transform duration-150 shrink-0"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
          <label className="min-w-0 text-xs sm:text-sm font-medium">
            به
            <select
              aria-label="واحد مقصد"
              className="w-full p-3 sm:p-3.5 bg-obsidian-card border border-white/10 rounded-xl mt-1.5 text-sm font-semibold truncate"
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
          className="rounded-2xl bg-bullion/5 border border-bullion/20 p-4 sm:p-5 min-w-0"
          aria-live="polite"
        >
          <div className="flex justify-between items-center gap-2 mb-2 min-w-0">
            <p className="text-xs text-on-surface-variant">مقدار معادل</p>
            {valid && (
              <button
                type="button"
                onClick={() => {
                  const formatted = result.toLocaleString("fa-IR", {
                    maximumFractionDigits:
                      target === "toman" || target === "rial" ? 0 : 6,
                  });
                  navigator.clipboard?.writeText(formatted).catch(() => {});
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
                className="text-xs text-bullion flex items-center gap-1 hover:underline shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    کپی شد
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    کپی نتیجه
                  </>
                )}
              </button>
            )}
          </div>
          <output className="font-num text-2xl sm:text-5xl font-black text-bullion drop-shadow-md break-all sm:break-words block">
            {valid
              ? result.toLocaleString("fa-IR", {
                  maximumFractionDigits:
                    target === "toman" || target === "rial" ? 0 : 6,
                })
              : "—"}
          </output>
          <div className="flex flex-wrap justify-between items-center gap-2 mt-2 min-w-0">
            <p className="text-sm font-bold">{resultLabel}</p>
            {Number.isFinite(unitCrossRate) && unitCrossRate > 0 && (
              <p className="text-xs text-on-surface-variant font-num break-words">
                نرخ واحد: ۱ {sourceLabel} ={" "}
                {unitCrossRate.toLocaleString("fa-IR", {
                  maximumFractionDigits:
                    target === "toman" || target === "rial" ? 0 : 6,
                })}{" "}
                {resultLabel}
              </p>
            )}
          </div>
          {!valid && (
            <p className="text-xs text-loss-text mt-3">
              عدد معتبر و نامنفی وارد کنید؛ هر دو دارایی باید نرخ موجود داشته
              باشند.
            </p>
          )}
        </div>
      </section>

      {/* Personal Asset Portfolio Calculator */}
      <section className="glass-panel rounded-2xl p-4 sm:p-6 space-y-4 w-full min-w-0">
        <div className="flex flex-wrap justify-between items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h2 className="font-bold text-sm sm:text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-bullion shrink-0" />
              <span>سبد دارایی شخصی (محاسبه ارزش کل دارایی‌ها)</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              موجودی ارز، طلا و سکه‌های خود را اضافه کنید تا ارزش لحظه‌ای کل سبد
              در همین مرورگر محاسبه شود.
            </p>
          </div>
          <div className="text-left min-w-0">
            <span className="text-[11px] text-on-surface-variant block">
              ارزش کل سبد دارایی
            </span>
            <span className="font-num text-base sm:text-xl font-black text-bullion-light break-all sm:break-words">
              {formatPrice(totalPortfolioRial / 10, unit, true)}
            </span>
          </div>
        </div>

        <form
          className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2.5 items-end min-w-0"
          onSubmit={(e) => {
            e.preventDefault();
            const val = parseLocalizedNumber(newHoldAmount);
            if (!Number.isFinite(val) || val <= 0) return;
            const existingIdx = holdings.findIndex(
              (h) => h.symbol === newHoldSymbol,
            );
            let next: PortfolioHolding[];
            if (existingIdx >= 0) {
              next = holdings.map((h, idx) =>
                idx === existingIdx ? { ...h, amount: h.amount + val } : h,
              );
            } else {
              next = [
                ...holdings,
                {
                  id: `${newHoldSymbol}-${Date.now()}`,
                  symbol: newHoldSymbol,
                  amount: val,
                },
              ];
            }
            saveHoldings(next);
            setNewHoldAmount("");
          }}
        >
          <label className="text-xs min-w-0">
            دارایی
            <select
              aria-label="دارایی سبد"
              value={newHoldSymbol}
              onChange={(e) => setNewHoldSymbol(e.target.value)}
              className="w-full mt-1.5 bg-obsidian-card border border-white/10 rounded-xl p-2.5 text-xs font-semibold truncate"
            >
              {items.map((item) => (
                <option key={item.id} value={item.symbol}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs min-w-0">
            تعداد / وزن / مقدار
            <input
              aria-label="مقدار دارایی سبد"
              inputMode="decimal"
              placeholder="مثلاً 500"
              value={newHoldAmount}
              onChange={(e) => setNewHoldAmount(e.target.value)}
              className="w-full mt-1.5 bg-obsidian-card border border-white/10 rounded-xl p-2.5 text-xs font-num"
              dir="ltr"
            />
          </label>
          <button
            type="submit"
            className="h-10 px-4 rounded-xl gold-gradient-btn text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 shrink-0" />
            افزودن به سبد
          </button>
        </form>

        {holdings.length > 0 && (
          <div className="divide-y divide-white/5 pt-2 min-w-0">
            {holdings.map((h) => {
              const item = items.find((i) => i.symbol === h.symbol);
              const valRial = h.amount * rate(h.symbol);
              return (
                <div
                  key={h.id}
                  className="py-2.5 flex items-center justify-between gap-2 text-xs min-w-0"
                >
                  <div className="min-w-0 truncate">
                    <span className="font-bold text-on-surface">
                      {item?.title || h.symbol}
                    </span>
                    <span className="text-on-surface-variant font-num mr-1.5">
                      ({toPersianDigits(h.amount)} واحد)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-num font-semibold text-bullion-light">
                      {Number.isFinite(valRial)
                        ? formatPrice(valRial / 10, unit, true)
                        : "—"}
                    </span>
                    <button
                      type="button"
                      aria-label={`حذف ${item?.title || h.symbol} از سبد`}
                      onClick={() =>
                        saveHoldings(holdings.filter((x) => x.id !== h.id))
                      }
                      className="p-1.5 text-loss-text hover:bg-loss/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Multi-Asset Cross Matrix */}
      <section className="glass-panel rounded-2xl p-4 sm:p-6 w-full min-w-0">
        <h2 className="font-bold text-sm mb-3.5">معادل در دارایی‌های دیگر</h2>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 min-w-0">
          {items.map((item) => {
            const converted = (amount * sourceRate) / rate(item.symbol);
            return (
              <div
                key={item.id}
                className="flex justify-between items-center gap-2 py-2.5 border-b border-white/5 text-xs min-w-0"
              >
                <span className="text-on-surface-variant truncate">
                  {item.title}
                </span>
                <span className="font-num font-bold text-on-surface shrink-0">
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
