'use client';

import React, { useState } from 'react';
import { MarketItem, CurrencyUnit, RateRegime } from '@/types/market';
import { formatPrice } from '@/lib/formatters';
import {
  ArrowLeftRight,
  RotateCw,
  Coins,
  History,
  Grid3X3,
  Scale,
  CheckCircle,
  TrendingDown,
} from 'lucide-react';

interface ConverterViewProps {
  forexItems: MarketItem[];
  goldItems: MarketItem[];
  coinItems: MarketItem[];
  unit: CurrencyUnit;
  initialSymbol?: string;
}

export const ConverterView: React.FC<ConverterViewProps> = ({
  forexItems,
  goldItems,
  coinItems,
  unit,
  initialSymbol = 'price_dollar_rl',
}) => {
  const [rateRegime, setRateRegime] = useState<RateRegime>('free');
  const [sourceAmount, setSourceAmount] = useState<number>(100);
  const [sourceCurrency, setSourceCurrency] = useState<string>(initialSymbol);
  const [targetCurrency, setTargetCurrency] = useState<string>('toman');
  const [isSwapping, setIsSwapping] = useState<boolean>(false);

  // Historical Purchasing Power State
  const [histPastMonths, setHistPastMonths] = useState<number>(12); // 12 months ago
  const [histTargetAsset, setHistTargetAsset] = useState<string>('usd');

  const allAssets = [...forexItems, ...goldItems, ...coinItems];

  // Regime multiplier
  const regimeMultiplier = rateRegime === 'sana' ? 0.74 : rateRegime === 'nima' ? 0.71 : 1.0;

  // Helper to get asset price in Tomans
  const getAssetPriceToman = (code: string): number => {
    if (code === 'toman') return 1;
    if (code === 'rial') return 0.1;
    const found = allAssets.find((a) => a.symbol === code || a.id === code);
    if (!found) return 1;
    return Math.round(found.priceToman * (found.category === 'gold' || found.category === 'coin' ? 1.0 : regimeMultiplier));
  };

  const sourcePriceToman = getAssetPriceToman(sourceCurrency);
  const targetPriceToman = getAssetPriceToman(targetCurrency);

  // Converted value in target currency
  const totalValueInToman = sourceAmount * sourcePriceToman;
  const convertedTargetValue = targetPriceToman > 0 ? totalValueInToman / targetPriceToman : 0;

  // Handle Swap
  const handleSwap = () => {
    setIsSwapping(true);
    const oldSource = sourceCurrency;
    const oldTarget = targetCurrency;
    setSourceCurrency(oldTarget);
    setTargetCurrency(oldSource);
    setTimeout(() => setIsSwapping(false), 300);
  };

  // Presets
  const applyPreset = (amount: number, symbol: string) => {
    setSourceAmount(amount);
    setSourceCurrency(symbol);
    setTargetCurrency('toman');
  };

  // Historical data factors
  const HISTORICAL_MULTIPLIERS: Record<number, number> = {
    1: 0.95, // 1 month ago
    6: 0.82, // 6 months ago
    12: 0.72, // 1 year ago (dollar was ~49,000)
    36: 0.42, // 3 years ago (dollar was ~28,000)
    60: 0.22, // 5 years ago (dollar was ~15,000)
  };

  const pastMultiplier = HISTORICAL_MULTIPLIERS[histPastMonths] || 0.72;
  const currentAssetPrice = getAssetPriceToman(histTargetAsset === 'usd' ? 'price_dollar_rl' : histTargetAsset === 'gold' ? 'geram18' : 'sekee');
  const pastAssetPrice = Math.round(currentAssetPrice * pastMultiplier);
  const currentAffordAmount = totalValueInToman > 0 && currentAssetPrice > 0 ? (totalValueInToman / currentAssetPrice).toFixed(2) : '۰';
  const pastAffordAmount = totalValueInToman > 0 && pastAssetPrice > 0 ? (totalValueInToman / pastAssetPrice).toFixed(2) : '۰';
  const purchasingPowerLoss = Math.round((1 - pastMultiplier) * 100);

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* Engine Header & Regime Switcher */}
      <section className="bg-surface-container-low rounded-2xl p-5 border border-white/[0.06] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
                ENGINE CALIBRATION V3.4
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/15 text-secondary text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                محاسبه بلادرنگ
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-on-surface mt-0.5">
              مبدل فوق‌پیشرفته ارز، مسکوکات و ریال
            </h1>
          </div>
        </div>

        {/* Rate Regimes */}
        <div className="flex items-center p-1 bg-surface-container-lowest rounded-xl border border-white/[0.08] self-start md:self-auto">
          <button
            onClick={() => setRateRegime('free')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              rateRegime === 'free'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            بازار آزاد
          </button>
          <button
            onClick={() => setRateRegime('sana')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              rateRegime === 'sana'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            سامانه سنا (رسمی)
          </button>
          <button
            onClick={() => setRateRegime('nima')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              rateRegime === 'nima'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            سامانه نیما (حواله)
          </button>
        </div>
      </section>

      {/* Preset Chips */}
      <section className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-on-surface-variant text-xs whitespace-nowrap pl-1">
          مقادیر پیش‌فرض کاربردی:
        </span>
        {[
          { label: '۱۰۰ دلار', amount: 100, symbol: 'price_dollar_rl' },
          { label: '۱,۰۰۰ دلار', amount: 1000, symbol: 'price_dollar_rl' },
          { label: '۱۰,۰۰۰ لیر', amount: 10000, symbol: 'price_try' },
          { label: '۵,۰۰۰ درهم', amount: 5000, symbol: 'price_aed' },
          { label: '۱ گرم طلا ۱۸', amount: 1, symbol: 'geram18' },
          { label: '۱ سکه امامی', amount: 1, symbol: 'sekee' },
        ].map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p.amount, p.symbol)}
            className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-white/[0.06] text-on-surface-variant hover:text-on-surface transition-all whitespace-nowrap active:scale-95 font-medium"
          >
            {p.label}
          </button>
        ))}
      </section>

      {/* Main Converter Card */}
      <section className="bg-surface-container-low rounded-2xl p-6 border border-white/[0.06] shadow-xl flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Source Input Box (5 Cols) */}
          <div className="md:col-span-5 bg-surface-container rounded-2xl p-4 border border-white/[0.08] flex flex-col gap-3">
            <span className="text-xs text-on-surface-variant font-medium">مقدار و دارایی مبدأ:</span>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                step="any"
                value={sourceAmount || ''}
                onChange={(e) => setSourceAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-2xl md:text-3xl font-extrabold font-mono text-on-surface focus:outline-none"
                placeholder="0"
              />
              <select
                value={sourceCurrency}
                onChange={(e) => setSourceCurrency(e.target.value)}
                className="bg-surface-container-high border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-bold text-primary focus:outline-none focus:border-primary shrink-0"
              >
                <option value="toman">تومان ایران</option>
                <option value="rial">ریال ایران</option>
                <option value="price_dollar_rl">دلار آمریکا (USD)</option>
                <option value="price_eur">یورو اروپا (EUR)</option>
                <option value="price_aed">درهم امارات (AED)</option>
                <option value="price_try">لیر ترکیه (TRY)</option>
                <option value="price_gbp">پوند انگلیس (GBP)</option>
                <option value="price_cad">دلار کانادا (CAD)</option>
                <option value="geram18">طلای ۱۸ عیار (گرم)</option>
                <option value="geram24">طلای ۲۴ عیار (گرم)</option>
                <option value="mesghal">مثقال طلا</option>
                <option value="sekee">سکه تمام امامی</option>
                <option value="sekeb">سکه بهار آزادی</option>
                <option value="nim">نیم سکه</option>
                <option value="rob">ربع سکه</option>
                <option value="gerami">سکه گرمی</option>
              </select>
            </div>
            <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-white/[0.04]">
              <span>ارزش هر واحد:</span>
              <span className="font-mono text-primary font-bold">
                {formatPrice(sourcePriceToman, unit, true)}
              </span>
            </div>
          </div>

          {/* Swap Button (1 Col) */}
          <div className="md:col-span-1 flex justify-center">
            <button
              type="button"
              onClick={handleSwap}
              className={`w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all ${
                isSwapping ? 'rotate-180' : ''
              }`}
              title="معکوس‌سازی مبدأ و مقصد"
            >
              <RotateCw className="w-5 h-5 transition-transform" />
            </button>
          </div>

          {/* Target Output Box (5 Cols) */}
          <div className="md:col-span-5 bg-surface-container rounded-2xl p-4 border border-white/[0.08] flex flex-col gap-3">
            <span className="text-xs text-on-surface-variant font-medium">مقدار معادل در مقصد:</span>
            <div className="flex items-center gap-3">
              <div className="w-full text-2xl md:text-3xl font-extrabold font-mono text-secondary truncate">
                {convertedTargetValue >= 1000
                  ? Math.round(convertedTargetValue).toLocaleString()
                  : convertedTargetValue.toFixed(3)}
              </div>
              <select
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
                className="bg-surface-container-high border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-bold text-primary focus:outline-none focus:border-primary shrink-0"
              >
                <option value="toman">تومان ایران</option>
                <option value="rial">ریال ایران</option>
                <option value="price_dollar_rl">دلار آمریکا (USD)</option>
                <option value="price_eur">یورو اروپا (EUR)</option>
                <option value="price_aed">درهم امارات (AED)</option>
                <option value="price_try">لیر ترکیه (TRY)</option>
                <option value="price_gbp">پوند انگلیس (GBP)</option>
                <option value="price_cad">دلار کانادا (CAD)</option>
                <option value="geram18">طلای ۱۸ عیار (گرم)</option>
                <option value="geram24">طلای ۲۴ عیار (گرم)</option>
                <option value="mesghal">مثقال طلا</option>
                <option value="sekee">سکه تمام امامی</option>
                <option value="sekeb">سکه بهار آزادی</option>
                <option value="nim">نیم سکه</option>
                <option value="rob">ربع سکه</option>
                <option value="gerami">سکه گرمی</option>
              </select>
            </div>
            <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-white/[0.04]">
              <span>ارزش کل تبدیل شده:</span>
              <span className="font-mono text-secondary font-bold">
                {formatPrice(totalValueInToman, unit, true)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Currency Basket Comparison (Multi-Currency Basket) */}
      <section className="bg-surface-container-low rounded-2xl border border-white/[0.06] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-on-surface">
              جدول مقایسه‌ای سبد تبدیل چند ارزی (Multi-Currency Basket)
            </h3>
          </div>
          <span className="text-xs text-on-surface-variant font-mono">
            برابری همزمان {sourceAmount} {sourceCurrency.replace('price_', '').toUpperCase()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-lowest/60 text-on-surface-variant border-b border-white/[0.06]">
                <th className="py-3 px-4">دارایی هدف</th>
                <th className="py-3 px-4 text-center">نرخ مرجع واحد</th>
                <th className="py-3 px-4 text-center">مقدار معادل</th>
                <th className="py-3 px-4 text-center">واحد</th>
                <th className="py-3 px-4 text-center">وضعیت نقدشوندگی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {[
                { title: 'تومان ایران', code: 'toman', unitLabel: 'تومان', liq: 'آنی (حساب بانکی)' },
                { title: 'ریال ایران', code: 'rial', unitLabel: 'ریال', liq: 'آنی (شاپرک)' },
                { title: 'دلار آمریکا (اسکناس)', code: 'price_dollar_rl', unitLabel: 'USD', liq: 'بسیار بالا' },
                { title: 'یورو اروپا', code: 'price_eur', unitLabel: 'EUR', liq: 'بسیار بالا' },
                { title: 'درهم امارات', code: 'price_aed', unitLabel: 'AED', liq: 'بسیار بالا (تضمینی)' },
                { title: 'لیر ترکیه', code: 'price_try', unitLabel: 'TRY', liq: 'بالا' },
                { title: 'طلای ۱۸ عیار خام', code: 'geram18', unitLabel: 'گرم', liq: 'آنی (بازار طلا)' },
                { title: 'سکه تمام طرح امامی', code: 'sekee', unitLabel: 'قطعه', liq: 'بسیار بالا' },
              ].map((row) => {
                const targetUnitP = getAssetPriceToman(row.code);
                const equivAmount = targetUnitP > 0 ? totalValueInToman / targetUnitP : 0;
                return (
                  <tr key={row.code} className="hover:bg-surface-container-high/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-on-surface">{row.title}</td>
                    <td className="py-3 px-4 text-center font-mono text-on-surface-variant">
                      {formatPrice(targetUnitP, unit, true)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-primary text-sm">
                      {equivAmount >= 1000 ? Math.round(equivAmount).toLocaleString() : equivAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-on-surface-variant text-[11px]">
                      {row.unitLabel}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-semibold">
                        {row.liq}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Historical Purchasing Power Module */}
      <section className="bg-surface-container-low rounded-2xl p-5 border border-white/[0.06] shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-on-surface">
                استعلام تاریخی قدرت خرید و نرخ‌های گذشته
              </h3>
              <p className="text-xs text-on-surface-variant">
                محاسبه قدرت خرید سرمایه ریالی فعلی شما در دوره‌های زمانی گذشته
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
            PURCHASING POWER
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Time Selector */}
          <div>
            <label className="block text-on-surface-variant mb-1.5 font-medium">
              بازه زمانی در گذشته:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: '۱ ماه پیش', months: 1 },
                { label: '۶ ماه پیش', months: 6 },
                { label: '۱ سال پیش', months: 12 },
                { label: '۳ سال پیش', months: 36 },
                { label: '۵ سال پیش', months: 60 },
              ].map((b) => (
                <button
                  key={b.months}
                  onClick={() => setHistPastMonths(b.months)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-medium border transition-all ${
                    histPastMonths === b.months
                      ? 'bg-primary-container text-on-primary-container border-primary font-bold shadow-sm'
                      : 'bg-surface-container border-white/[0.06] text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Selector */}
          <div>
            <label className="block text-on-surface-variant mb-1.5 font-medium">دارایی مقایسه‌ای:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'usd', label: 'دلار آمریکا' },
                { id: 'gold', label: 'طلای ۱۸ عیار' },
                { id: 'sekee', label: 'سکه امامی' },
              ].map((a) => (
                <button
                  key={a.id}
                  onClick={() => setHistTargetAsset(a.id)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-medium border transition-all ${
                    histTargetAsset === a.id
                      ? 'bg-primary-container text-on-primary-container border-primary font-bold shadow-sm'
                      : 'bg-surface-container border-white/[0.06] text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result Highlight */}
          <div className="bg-surface-container p-4 rounded-xl border border-white/[0.06] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">کاهش ارزش برابری ریال:</span>
              <span className="font-mono font-bold text-error flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>-{purchasingPowerLoss}٪</span>
              </span>
            </div>
            <div className="pt-2 border-t border-white/[0.06] flex items-baseline justify-between">
              <span className="text-[11px] text-on-surface-variant">مقدار قابل خرید در گذشته:</span>
              <span className="text-lg font-bold font-mono text-primary">{pastAffordAmount} واحد</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Tier Market Spread Comparison */}
      <section className="bg-surface-container-low rounded-2xl p-5 border border-white/[0.06] shadow-xl flex flex-col gap-3">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
          <Scale className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-on-surface">
            مقایسه نرخ‌های سه‌گانه ارز (آزاد، سنا و نیما)
          </h3>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          سامانه سنا مختص مصارف خدماتی و دانشجویی طبق سرفصل‌های بانک مرکزی با میانگین نرخ ۵۰,۴۵۰ تومان تخصیص می‌یابد. سامانه حواله نیما با نرخ پایه ۴۸,۹۰۰ تومان جهت واردات خطوط تولید و کالاهای استراتژیک عرضه می‌شود و بازار آزاد صرافی‌ها در سطح ۶۸,۴۵۰ تومان معامله می‌گردد.
        </p>
      </section>
    </div>
  );
};
