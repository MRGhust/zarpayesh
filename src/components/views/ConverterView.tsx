'use client';

import React, { useState } from 'react';
import { MarketItem, CurrencyUnit, RateRegime } from '@/types/market';
import { formatPrice } from '@/lib/formatters';
import {
  ArrowLeftRight,
  RotateCw,
  History,
  Grid3X3,
  Scale,
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
  const [histPastMonths, setHistPastMonths] = useState<number>(12);
  const [histTargetAsset, setHistTargetAsset] = useState<string>('usd');

  const allAssets = [...forexItems, ...goldItems, ...coinItems];

  // Regime multiplier
  const regimeMultiplier = rateRegime === 'sana' ? 0.76 : rateRegime === 'nima' ? 0.75 : 1.0;

  // Helper to get asset price in Tomans
  const getAssetPriceToman = (code: string): number => {
    if (code === 'toman') return 1;
    if (code === 'rial') return 0.1;
    const found = allAssets.find((a) => a.symbol === code || a.id === code);
    if (!found) return 1;
    return Math.round(
      found.priceToman *
        (found.category === 'gold' || found.category === 'coin' ? 1.0 : regimeMultiplier)
    );
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

  // Presets (including Ukrainian Hryvnia)
  const applyPreset = (amount: number, symbol: string) => {
    setSourceAmount(amount);
    setSourceCurrency(symbol);
    setTargetCurrency('toman');
  };

  // Historical data factors
  const HISTORICAL_MULTIPLIERS: Record<number, number> = {
    1: 0.96,
    6: 0.84,
    12: 0.65,
    36: 0.38,
    60: 0.18,
  };

  const pastMultiplier = HISTORICAL_MULTIPLIERS[histPastMonths] || 0.65;
  const currentAssetPrice = getAssetPriceToman(
    histTargetAsset === 'usd'
      ? 'price_dollar_rl'
      : histTargetAsset === 'gold'
      ? 'geram18'
      : 'sekee'
  );
  const pastAssetPrice = Math.round(currentAssetPrice * pastMultiplier);
  const currentAffordAmount =
    totalValueInToman > 0 && currentAssetPrice > 0
      ? (totalValueInToman / currentAssetPrice).toFixed(2)
      : '۰';
  const pastAffordAmount =
    totalValueInToman > 0 && pastAssetPrice > 0
      ? (totalValueInToman / pastAssetPrice).toFixed(2)
      : '۰';
  const purchasingPowerLoss = Math.round((1 - pastMultiplier) * 100);

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* Engine Header & Regime Switcher */}
      <section className="glass-panel rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-bullion/20 to-transparent border border-bullion/30 flex items-center justify-center text-bullion shadow-inner">
            <ArrowLeftRight className="w-6 h-6 text-bullion-light" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-bullion-light font-bold">
                ENGINE CALIBRATION V3.4
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gain-surface border border-gain-border text-gain-text text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-gain animate-ping"></span>
                محاسبه بلادرنگ
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-black text-on-surface mt-0.5">
              مبدل فوق‌پیشرفته ارز، مسکوکات و ریال
            </h1>
          </div>
        </div>

        {/* Rate Regimes */}
        <div className="flex items-center p-1 bg-obsidian-950 rounded-xl border border-white/[0.08] self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setRateRegime('free')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              rateRegime === 'free'
                ? 'gold-gradient-btn'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            بازار آزاد
          </button>
          <button
            onClick={() => setRateRegime('sana')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              rateRegime === 'sana'
                ? 'gold-gradient-btn'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            سامانه سنا (رسمی)
          </button>
          <button
            onClick={() => setRateRegime('nima')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              rateRegime === 'nima'
                ? 'gold-gradient-btn'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            سامانه نیما (حواله)
          </button>
        </div>
      </section>

      {/* Preset Chips */}
      <section className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-on-surface-variant text-xs whitespace-nowrap pl-1 font-medium">
          مقادیر پیش‌فرض کاربردی:
        </span>
        {[
          { label: '۱۰۰ دلار', amount: 100, symbol: 'price_dollar_rl' },
          { label: '۱,۰۰۰ دلار', amount: 1000, symbol: 'price_dollar_rl' },
          { label: '۵,۰۰۰ گریونا', amount: 5000, symbol: 'price_uah' },
          { label: '۱۰,۰۰۰ لیر', amount: 10000, symbol: 'price_try' },
          { label: '۵,۰۰۰ درهم', amount: 5000, symbol: 'price_aed' },
          { label: '۱ گرم طلا ۱۸', amount: 1, symbol: 'geram18' },
          { label: '۱ سکه امامی', amount: 1, symbol: 'sekee' },
        ].map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p.amount, p.symbol)}
            className="px-3 py-1.5 rounded-xl bg-obsidian-card hover:bg-obsidian-surface border border-white/[0.08] hover:border-bullion/40 text-on-surface-variant hover:text-bullion-light transition-all whitespace-nowrap active:scale-95 font-bold"
          >
            {p.label}
          </button>
        ))}
      </section>

      {/* Main Converter Card */}
      <section className="glass-panel rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Source Input Box (5 Cols) */}
          <div className="md:col-span-5 bg-obsidian-card rounded-2xl p-4 sm:p-5 border border-white/[0.08] flex flex-col gap-3">
            <span className="text-xs text-on-surface-variant font-medium">مقدار و دارایی مبدأ:</span>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                step="any"
                value={sourceAmount || ''}
                onChange={(e) => setSourceAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-2xl sm:text-3xl font-black font-mono text-on-surface focus:outline-none tabular-nums"
                placeholder="0"
              />
              <select
                value={sourceCurrency}
                onChange={(e) => setSourceCurrency(e.target.value)}
                className="bg-obsidian-surface border border-white/[0.12] rounded-xl px-3 py-2 text-xs font-bold text-bullion-light focus:outline-none focus:border-bullion shrink-0"
              >
                <option value="toman">تومان ایران</option>
                <option value="rial">ریال ایران</option>
                <option value="price_dollar_rl">دلار آمریکا (USD)</option>
                <option value="price_eur">یورو اروپا (EUR)</option>
                <option value="price_aed">درهم امارات (AED)</option>
                <option value="price_try">لیر ترکیه (TRY)</option>
                <option value="price_uah">گریونا اوکراین (UAH)</option>
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
              <span className="font-mono text-bullion-light font-bold tabular-nums">
                {formatPrice(sourcePriceToman, unit, true)}
              </span>
            </div>
          </div>

          {/* Swap Button (1 Col) */}
          <div className="md:col-span-1 flex justify-center py-2 md:py-0">
            <button
              type="button"
              onClick={handleSwap}
              className={`w-12 h-12 rounded-2xl gold-gradient-btn flex items-center justify-center transition-all active:scale-90 ${
                isSwapping ? 'rotate-180' : ''
              }`}
              title="معکوس‌سازی مبدأ و مقصد"
            >
              <RotateCw className="w-5 h-5 transition-transform" />
            </button>
          </div>

          {/* Target Output Box (5 Cols) */}
          <div className="md:col-span-5 bg-obsidian-card rounded-2xl p-4 sm:p-5 border border-white/[0.08] flex flex-col gap-3">
            <span className="text-xs text-on-surface-variant font-medium">مقدار معادل در مقصد:</span>
            <div className="flex items-center gap-3">
              <div className="w-full text-2xl sm:text-3xl font-black font-mono gold-gradient-text truncate tabular-nums">
                {convertedTargetValue >= 1000
                  ? Math.round(convertedTargetValue).toLocaleString()
                  : convertedTargetValue.toFixed(3)}
              </div>
              <select
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
                className="bg-obsidian-surface border border-white/[0.12] rounded-xl px-3 py-2 text-xs font-bold text-bullion-light focus:outline-none focus:border-bullion shrink-0"
              >
                <option value="toman">تومان ایران</option>
                <option value="rial">ریال ایران</option>
                <option value="price_dollar_rl">دلار آمریکا (USD)</option>
                <option value="price_eur">یورو اروپا (EUR)</option>
                <option value="price_aed">درهم امارات (AED)</option>
                <option value="price_try">لیر ترکیه (TRY)</option>
                <option value="price_uah">گریونا اوکراین (UAH)</option>
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
              <span>ارزش کل بر حسب واحد فعال:</span>
              <span className="font-mono text-gain-text font-bold tabular-nums">
                {formatPrice(totalValueInToman, unit, true)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Currency Basket Comparison Table */}
      <section className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-bullion" />
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
              <tr className="bg-obsidian-950/70 text-on-surface-variant border-b border-white/[0.06] font-bold">
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
                { title: 'گریونا اوکراین', code: 'price_uah', unitLabel: 'UAH', liq: 'متوسط' },
                { title: 'طلای ۱۸ عیار خام', code: 'geram18', unitLabel: 'گرم', liq: 'آنی (بازار طلا)' },
                { title: 'سکه تمام طرح امامی', code: 'sekee', unitLabel: 'قطعه', liq: 'بسیار بالا' },
              ].map((row) => {
                const targetUnitP = getAssetPriceToman(row.code);
                const equivAmount = targetUnitP > 0 ? totalValueInToman / targetUnitP : 0;
                return (
                  <tr key={row.code} className="hover:bg-obsidian-surface/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-on-surface">{row.title}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-on-surface-variant tabular-nums">
                      {formatPrice(targetUnitP, unit, true)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-black gold-gradient-text text-sm tabular-nums">
                      {equivAmount >= 1000
                        ? Math.round(equivAmount).toLocaleString()
                        : equivAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-on-surface-variant text-[11px]">
                      {row.unitLabel}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-gain-surface border border-gain-border text-gain-text text-[10px] font-bold">
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
      <section className="glass-panel rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-bullion" />
            <div>
              <h3 className="text-sm font-bold text-on-surface">
                استعلام تاریخی قدرت خرید و نرخ‌های گذشته
              </h3>
              <p className="text-xs text-on-surface-variant">
                محاسبه قدرت خرید سرمایه ریالی فعلی شما در دوره‌های زمانی گذشته
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-bullion/10 border border-bullion/20 text-bullion-light font-bold">
            PURCHASING POWER
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs">
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
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all active:scale-95 ${
                    histPastMonths === b.months
                      ? 'gold-gradient-btn'
                      : 'bg-obsidian-card border-white/[0.08] text-on-surface-variant hover:text-on-surface'
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
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all active:scale-95 ${
                    histTargetAsset === a.id
                      ? 'gold-gradient-btn'
                      : 'bg-obsidian-card border-white/[0.08] text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result Highlight */}
          <div className="bg-obsidian-card p-4 rounded-xl border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">کاهش ارزش برابری ریال:</span>
              <span className="font-mono font-bold text-loss-text flex items-center gap-1 tabular-nums">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>-{purchasingPowerLoss}٪</span>
              </span>
            </div>
            <div className="pt-2 border-t border-white/[0.06] flex items-baseline justify-between">
              <span className="text-[11px] text-on-surface-variant">مقدار قابل خرید در گذشته:</span>
              <span className="text-lg font-black font-mono gold-gradient-text tabular-nums">
                {pastAffordAmount} واحد
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Tier Market Spread Comparison */}
      <section className="glass-panel rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
          <Scale className="w-5 h-5 text-bullion" />
          <h3 className="text-sm font-bold text-on-surface">
            مقایسه نرخ‌های سه‌گانه ارز (آزاد، سنا و نیما)
          </h3>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          سامانه سنا مختص مصارف خدماتی و دانشجویی طبق سرفصل‌های بانک مرکزی با میانگین نرخ ۲۰۱,۳۰۰ تومان تخصیص می‌یابد. سامانه حواله نیما با نرخ پایه ۱۹۸,۵۰۰ تومان جهت واردات خطوط تولید و کالاهای استراتژیک عرضه می‌شود و بازار آزاد صرافی‌ها در سطح ۲۶۳,۹۰۰ تومان معامله می‌گردد.
        </p>
      </section>
    </div>
  );
};
