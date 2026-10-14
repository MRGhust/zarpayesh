'use client';

import React, { useState } from 'react';
import { MarketItem, CurrencyUnit } from '@/types/market';
import { X, BellRing, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MarketItem[];
  unit: CurrencyUnit;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  items,
  unit,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(items[0]?.symbol || 'price_dollar_rl');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentItem = items.find((i) => i.symbol === selectedSymbol) || items[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice) return;
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-surface-container-low border border-white/[0.12] rounded-2xl shadow-2xl p-6 text-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">ثبت هشدار هوشمند نوسان قیمت</h3>
              <p className="text-xs text-on-surface-variant">اطلاع‌رسانی بلادرنگ تغییر نرخ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSaved ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
            <CheckCircle2 className="w-12 h-12 text-secondary animate-bounce" />
            <h4 className="text-base font-bold text-on-surface">هشدار با موفقیت ثبت شد</h4>
            <p className="text-xs text-on-surface-variant">
              به محض رسیدن قیمت به سطح مدنظر، سیستم با آلارم صوتی شما را مطلع خواهد کرد.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            {/* Asset Selection */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                انتخاب دارایی یا ارز
              </label>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-full bg-surface-container-high text-on-surface border border-white/[0.1] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary/50"
              >
                {items.map((it) => (
                  <option key={it.symbol} value={it.symbol}>
                    {it.title} ({formatPrice(it.priceToman, unit, true, it.symbol === 'ons')})
                  </option>
                ))}
              </select>
            </div>

            {/* Current Reference Price */}
            {currentItem && (
              <div className="bg-surface-container p-3 rounded-xl border border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">نرخ فعلی بازار:</span>
                <span className="font-mono font-bold text-primary">
                  {formatPrice(currentItem.priceToman, unit, true, currentItem.symbol === 'ons')}
                </span>
              </div>
            )}

            {/* Condition */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                شرط فعال‌سازی
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCondition('above')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    condition === 'above'
                      ? 'bg-secondary/15 text-secondary border-secondary/40 font-bold'
                      : 'bg-surface-container-high text-on-surface-variant border-white/[0.06]'
                  }`}
                >
                  صعودی (رسیدن یا عبور از سقف)
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('below')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                    condition === 'below'
                      ? 'bg-error/15 text-error border-error/40 font-bold'
                      : 'bg-surface-container-high text-on-surface-variant border-white/[0.06]'
                  }`}
                >
                  نزولی (رسیدن یا افت به زیر کف)
                </button>
              </div>
            </div>

            {/* Target Price */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                قیمت هدف ({unit === 'toman' ? 'تومان' : 'ریال'})
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="مثلاً ۶۹۰۰۰"
                required
                className="w-full bg-surface-container-high text-on-surface border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary/50"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="mt-2 w-full py-2.5 bg-primary-container hover:bg-primary text-on-primary-container font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-98"
            >
              فعال‌سازی هشدار هوشمند
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
