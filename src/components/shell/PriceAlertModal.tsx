"use client";
import { useEffect, useRef, useState } from "react";
import { X, BellRing, Trash2 } from "lucide-react";
import { MarketItem, CurrencyUnit } from "@/types/market";
import { formatPrice, parseLocalizedNumber } from "@/lib/formatters";
import { BrowserAlert, readAlerts, saveAlerts } from "@/lib/alerts";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: MarketItem[];
  unit: CurrencyUnit;
  initialSymbol: string;
}
export function PriceAlertModal({
  isOpen,
  onClose,
  items,
  unit,
  initialSymbol,
}: Props) {
  const [symbol, setSymbol] = useState("price_dollar_rl"),
    [price, setPrice] = useState(""),
    [condition, setCondition] = useState<"above" | "below">("above"),
    [alerts, setAlerts] = useState<BrowserAlert[]>([]),
    [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDivElement>(null),
    close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    setSymbol(initialSymbol);
    setAlerts(readAlerts());
    setNotice("");
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [isOpen, initialSymbol]);
  if (!isOpen) return null;
  const current = items.find((item) => item.symbol === symbol),
    currency =
      current?.id === "ons" ? "دلار" : unit === "rial" ? "ریال" : "تومان";
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2.5 sm:p-3 bg-black/75 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-title"
        className="w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-surface-container-low border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl"
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if (e.key === "Tab") {
            const elements = dialog.current?.querySelectorAll<HTMLElement>(
              "button:not(:disabled),input,select",
            );
            if (!elements?.length) return;
            const first = elements[0],
              last = elements[elements.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="alert-title" className="font-bold flex items-center gap-2">
            <BellRing className="text-bullion w-5 h-5" />
            هشدار قیمت
          </h2>
          <button
            ref={close}
            type="button"
            aria-label="بستن هشدار"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-on-surface-variant leading-7 mb-5">
          هشدار در همین مرورگر ذخیره می‌شود و وقتی سایت باز است بررسی می‌شود.
          برای اعلان در زمان بسته بودن سایت، از بات تلگرام استفاده کنید.
        </p>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const value = parseLocalizedNumber(price);
            if (!current || !Number.isFinite(value) || value <= 0) {
              setNotice("قیمت هدف معتبر و مثبت وارد کنید.");
              return;
            }
            if (alerts.length >= 30) {
              setNotice("حداکثر ۳۰ هشدار مجاز است.");
              return;
            }
            try {
              const id =
                typeof crypto !== "undefined" &&
                typeof crypto.randomUUID === "function"
                  ? crypto.randomUUID()
                  : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
              const next = [
                ...alerts,
                {
                  id,
                  symbol,
                  threshold:
                    current.id === "ons" || unit === "rial"
                      ? value
                      : value * 10,
                  direction: condition,
                  triggered: false,
                },
              ];
              saveAlerts(next);
              setAlerts(next);
              setNotice("هشدار در این مرورگر ذخیره شد.");
              setPrice("");
            } catch {
              setNotice("ذخیره‌سازی مرورگر در دسترس نیست.");
            }
          }}
        >
          <label className="block text-xs">
            دارایی
            <select
              aria-label="دارایی هشدار"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full mt-2 bg-obsidian-card rounded-xl border border-white/10 p-3"
            >
              {items.map((item) => (
                <option key={item.id} value={item.symbol}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          {current && (
            <p className="text-xs text-on-surface-variant">
              قیمت فعلی:{" "}
              <span className="font-num text-bullion">
                {formatPrice(
                  current.priceToman,
                  unit,
                  true,
                  current.id === "ons",
                )}
              </span>
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {(["above", "below"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={condition === value}
                className={`rounded-xl py-3 text-xs ${condition === value ? "gold-gradient-btn" : "bg-obsidian-card"}`}
                onClick={() => setCondition(value)}
              >
                {value === "above" ? "رسیدن به سقف" : "رسیدن به کف"}
              </button>
            ))}
          </div>
          <label className="block text-xs">
            قیمت هدف ({currency})
            <input
              aria-label="قیمت هدف"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="mt-2 w-full bg-obsidian-card border border-white/10 rounded-xl p-3 font-num"
              dir="ltr"
            />
          </label>
          <button
            type="submit"
            disabled={!current}
            className="w-full gold-gradient-btn py-3 rounded-xl text-sm"
          >
            ذخیرهٔ هشدار
          </button>
          <p role="status" className="text-xs text-bullion">
            {notice}
          </p>
        </form>
        {alerts.length > 0 && (
          <div className="mt-6 border-t border-white/10 pt-4">
            <h3 className="text-sm font-bold mb-3">هشدارهای این مرورگر</h3>
            {alerts.map((alert) => {
              const item = items.find((i) => i.symbol === alert.symbol);
              return (
                <div
                  key={alert.id}
                  className="flex justify-between items-center gap-3 py-3 border-b border-white/5 text-xs"
                >
                  <div className="min-w-0">
                    <p className="truncate">
                      {item?.title || alert.symbol} •{" "}
                      {alert.triggered
                        ? "فعال شده"
                        : alert.direction === "above"
                          ? "سقف"
                          : "کف"}
                    </p>
                    <p className="font-num mt-1 text-on-surface-variant truncate">
                      {formatPrice(
                        item?.id === "ons"
                          ? alert.threshold
                          : alert.threshold / 10,
                        unit,
                        true,
                        item?.id === "ons",
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`حذف هشدار ${item?.title || alert.symbol}`}
                    onClick={() => {
                      try {
                        const next = alerts.filter((a) => a.id !== alert.id);
                        saveAlerts(next);
                        setAlerts(next);
                      } catch {
                        setNotice("حذف هشدار ناموفق بود.");
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-loss-text" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
