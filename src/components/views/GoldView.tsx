'use client';

import React, { useState } from 'react';
import { MarketItem, CurrencyUnit } from '@/types/market';
import { formatPrice } from '@/lib/formatters';
import {
  Gem,
  Coins,
  Scale,
  Calculator,
  AlertTriangle,
  FileCheck2,
  Percent,
  Check,
  TrendingUp,
} from 'lucide-react';

interface GoldViewProps {
  goldItems: MarketItem[];
  coinItems: MarketItem[];
  unit: CurrencyUnit;
  onOpenAlertModal: () => void;
  onSelectConverter: (symbol: string) => void;
}

export const GoldView: React.FC<GoldViewProps> = ({
  goldItems,
  coinItems,
  unit,
  onOpenAlertModal,
  onSelectConverter,
}) => {
  // Gold Invoice Calculator States
  const [weightGrams, setWeightGrams] = useState<number>(4.25);
  const [makingFeePercent, setMakingFeePercent] = useState<number>(14);
  const [sellerProfitPercent, setSellerProfitPercent] = useState<number>(7);
  const [includeVat, setIncludeVat] = useState<boolean>(true);

  // Timeframe for correlation chart
  const [chartTimeframe, setChartTimeframe] = useState<'30D' | '3M' | '6M' | '1Y'>('30D');

  const gold18Item = goldItems.find((g) => g.symbol === 'geram18');
  const gold18PriceToman = gold18Item ? gold18Item.priceToman : 26038800;
  const mesghalItem = goldItems.find((g) => g.symbol === 'mesghal');
  const ounceItem = goldItems.find((g) => g.symbol === 'ons');
  const gold24Item = goldItems.find((g) => g.symbol === 'geram24');

  // Official Union Gold Calculation Formula:
  const rawGoldValue = weightGrams * gold18PriceToman;
  const makingFeeValue = rawGoldValue * (makingFeePercent / 100);
  const sellerProfitValue = (rawGoldValue + makingFeeValue) * (sellerProfitPercent / 100);
  const vatValue = includeVat ? (makingFeeValue + sellerProfitValue) * 0.09 : 0;
  const finalTotalInvoice = rawGoldValue + makingFeeValue + sellerProfitValue + vatValue;

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* 4 Gold Benchmark Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: انس جهانی طلا */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 flex items-center justify-between relative overflow-hidden group transition-all">
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-on-surface-variant text-xs font-medium">انس طلا (بازار جهانی XAU)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono gold-gradient-text tabular-nums">
                ${ounceItem ? ounceItem.priceToman.toLocaleString() : '۴,۰۸۲.۶۶'}
              </span>
            </div>
            <span className="text-gain-text text-[11px] font-mono flex items-center gap-1">
              <span>+۱.۸۷٪ صعود در کامکس نیویورک</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-bullion/10 border border-bullion/20 flex items-center justify-center text-bullion-light z-10 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Gem className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: مظنه مثقال طلا */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 flex items-center justify-between relative overflow-hidden group transition-all">
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-on-surface-variant text-xs font-medium">مظنه طلا (مثقال پایه ۱۷ عیار)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-on-surface tabular-nums">
                {mesghalItem ? formatPrice(mesghalItem.priceToman, unit, false) : '۱۱۲,۷۹۷,۰۰۰'}
              </span>
              <span className="text-on-surface-variant text-xs">{unit === 'toman' ? 'تومان' : 'ریال'}</span>
            </div>
            <span className="text-on-surface-variant/80 text-[11px] font-mono">
              معادل ۴.۶۰۸ گرم طلای ۷۰۵ تهران
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-obsidian-card border border-white/[0.08] flex items-center justify-center text-on-surface z-10">
            <Scale className="w-6 h-6 text-bullion" />
          </div>
        </div>

        {/* Card 3: طلای ۱۸ عیار خام */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 flex items-center justify-between relative overflow-hidden group transition-all">
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-on-surface-variant text-xs font-medium">طلای ۱۸ عیار خام (هر گرم ۷۵۰)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono gold-gradient-text tabular-nums">
                {formatPrice(gold18PriceToman, unit, false)}
              </span>
              <span className="text-on-surface-variant text-xs">{unit === 'toman' ? 'تومان' : 'ریال'}</span>
            </div>
            <span className="text-gain-text text-[11px] font-mono flex items-center gap-1">
              <span>+۱.۱۶٪ (+۲۹۹,۲۰۰ تومان)</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-bullion/10 border border-bullion/20 flex items-center justify-center text-bullion z-10 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Coins className="w-6 h-6 text-bullion-light" />
          </div>
        </div>

        {/* Card 4: طلای ۲۴ عیار شمش */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 flex items-center justify-between relative overflow-hidden group transition-all">
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-on-surface-variant text-xs font-medium">طلای ۲۴ عیار (هر گرم ۹۹۹)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-on-surface tabular-nums">
                {gold24Item ? formatPrice(gold24Item.priceToman, unit, false) : '۳۴,۷۱۸,۱۰۰'}
              </span>
              <span className="text-on-surface-variant text-xs">{unit === 'toman' ? 'تومان' : 'ریال'}</span>
            </div>
            <span className="text-on-surface-variant/80 text-[11px] font-mono">
              پایه شمش استاندارد بورس کالا
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gain-surface border border-gain-border flex items-center justify-center text-gain-text z-10">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Market Pulse Banner */}
      <section className="glass-panel rounded-2xl p-4 border border-bullion/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-bullion/20 border border-bullion/30 flex items-center justify-center text-bullion shrink-0">
            <AlertTriangle className="w-5 h-5 text-bullion-light" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">
              صعود انس طلای جهانی به کانال تاریخی ۴۰۸۰ دلار
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              میانگین حباب مسکوکات در محدوده ۱۲.۵٪ قرار دارد. کم‌ریسک‌ترین سکه: بهار آزادی (۸.۱٪) • پرریسک‌ترین: ربع سکه (۲۱.۸٪)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectConverter('sekee')}
            className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
          >
            محاسبه حباب در مبدل
          </button>
        </div>
      </section>

      {/* Two-Column Section: Correlation Chart (Left) + Invoice Calculator (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left: Correlation Chart (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-on-surface">
                همبستگی ۳۰ روزه طلای ۱۸ عیار با انس جهانی و دلار
              </h3>
              <p className="text-xs text-on-surface-variant">ضریب همبستگی طلای داخلی با انس جهانی: ۰.۸۹</p>
            </div>
            <div className="flex items-center p-1 bg-obsidian-950 rounded-xl border border-white/[0.08] text-xs font-mono">
              {(['30D', '3M', '6M', '1Y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    chartTimeframe === tf
                      ? 'gold-gradient-btn'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Chart SVG Representation */}
          <div className="w-full h-52 sm:h-60 relative flex items-center justify-center p-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200">
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Horizontal Grid lines */}
              <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />

              {/* Gold 18K Area & Line */}
              <path
                d="M 0,160 Q 75,150 150,130 T 300,100 T 450,70 T 600,30 L 600,200 L 0,200 Z"
                fill="url(#goldGrad)"
              />
              <path
                d="M 0,160 Q 75,150 150,130 T 300,100 T 450,70 T 600,30"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="3.2"
                strokeLinecap="round"
              />

              {/* Dollar Reference Line */}
              <path
                d="M 0,170 Q 75,165 150,150 T 300,120 T 450,90 T 600,60"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.2"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-bullion-light font-bold">
                <span className="w-3 h-1 bg-bullion rounded"></span>
                <span>طلای ۱۸ عیار</span>
              </span>
              <span className="flex items-center gap-1.5 text-gain-text font-bold">
                <span className="w-3 h-1 bg-gain rounded border-dashed"></span>
                <span>دلار آزاد فردوسی</span>
              </span>
            </div>
            <span className="text-on-surface-variant/70 text-[11px] font-mono">
              شیب صعودی پایدار
            </span>
          </div>
        </div>

        {/* Right: Gold Invoice Calculator (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-bullion-light" />
              <h3 className="text-sm font-bold text-on-surface">محاسبه‌گر رسمی فاکتور طلا</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bullion/10 text-bullion-light border border-bullion/20 font-bold">
              فرمول اتحادیه
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Weight */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-on-surface-variant">وزن طلا:</span>
                <span className="font-mono font-bold text-bullion-light text-sm tabular-nums">
                  {weightGrams} گرم
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="50"
                step="0.25"
                value={weightGrams}
                onChange={(e) => setWeightGrams(parseFloat(e.target.value))}
                className="w-full accent-bullion cursor-pointer"
              />
            </div>

            {/* Making Fee */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-on-surface-variant">اجرت ساخت (%):</span>
                <span className="font-mono font-bold text-on-surface text-sm tabular-nums">
                  {makingFeePercent}٪
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={makingFeePercent}
                onChange={(e) => setMakingFeePercent(parseInt(e.target.value, 10))}
                className="w-full accent-bullion cursor-pointer"
              />
            </div>

            {/* Profit & VAT Toggle */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="block text-on-surface-variant text-[11px] mb-1">سود قانونی فروشنده</span>
                <div className="p-2.5 bg-obsidian-card rounded-xl font-mono text-center font-bold text-on-surface border border-white/[0.06]">
                  ۷٪ مصوب
                </div>
              </div>
              <div>
                <span className="block text-on-surface-variant text-[11px] mb-1">مالیات ۹٪ (فقط اجرت و سود)</span>
                <button
                  type="button"
                  onClick={() => setIncludeVat(!includeVat)}
                  className={`w-full p-2.5 rounded-xl text-center font-bold transition-all flex items-center justify-center gap-1 active:scale-95 ${
                    includeVat
                      ? 'gold-gradient-btn'
                      : 'bg-obsidian-card text-on-surface-variant border border-white/[0.06]'
                  }`}
                >
                  {includeVat ? <Check className="w-4 h-4" /> : null}
                  <span>{includeVat ? 'محاسبه شود' : 'بدون مالیات'}</span>
                </button>
              </div>
            </div>

            {/* Invoice Breakdown Results */}
            <div className="mt-2 p-3.5 rounded-xl bg-obsidian-card border border-white/[0.06] space-y-2 font-mono text-xs tabular-nums">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">ارزش طلای خام:</span>
                <span>{formatPrice(rawGoldValue, unit, true)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">مبلغ اجرت ساخت:</span>
                <span>{formatPrice(makingFeeValue, unit, true)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">سود طلافروش (۷٪):</span>
                <span>{formatPrice(sellerProfitValue, unit, true)}</span>
              </div>
              {includeVat && (
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">مالیات بر ارزش افزوده (۹٪):</span>
                  <span>{formatPrice(vatValue, unit, true)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between font-extrabold text-sm">
                <span className="gold-gradient-text">مبلغ نهایی فاکتور:</span>
                <span className="gold-gradient-text text-base">
                  {formatPrice(finalTotalInvoice, unit, true)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sovereign Coin Matrix Desktop Table (Hidden on mobile < 1024px) */}
      <section className="hidden lg:block glass-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-on-surface flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-bullion"></span>
              <span>ماتریس حباب مسکوکات بانکی و ارزش ذاتی طلا</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              بررسی تفاوت قیمت بازار با ارزش شمش طلای موجود در سکه بر اساس عیار قانونی ۹۰۰ (۲۱.۶)
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-obsidian-950 border border-white/[0.06] text-bullion-light font-bold">
            BUBBLE TRACKER
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-obsidian-950/70 text-on-surface-variant border-b border-white/[0.06] font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-5">نام مسکوک قانونی</th>
                <th className="py-3.5 px-4 text-center">وزن قانونی (گرم)</th>
                <th className="py-3.5 px-4 text-center">عیار</th>
                <th className="py-3.5 px-4 text-center">ارزش ذاتی طلا</th>
                <th className="py-3.5 px-4 text-center">قیمت روز بازار</th>
                <th className="py-3.5 px-4 text-center">مبلغ اسمی حباب</th>
                <th className="py-3.5 px-4 text-center">درصد حباب</th>
                <th className="py-3.5 px-4 text-center">وضعیت ریسک</th>
                <th className="py-3.5 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {coinItems.map((coin) => {
                const bubblePct = coin.bubblePercent || 12;
                const isHighRisk = bubblePct > 20;
                const isMedRisk = bubblePct > 10 && bubblePct <= 20;

                return (
                  <tr
                    key={coin.symbol}
                    className="hover:bg-obsidian-surface/60 transition-colors group"
                  >
                    {/* Title */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-bullion/10 border border-bullion/20 flex items-center justify-center text-bullion font-bold text-sm">
                          🪙
                        </div>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-on-surface text-sm group-hover:text-bullion-light transition-colors">
                            {coin.title}
                          </span>
                          <span className="text-[11px] font-mono text-on-surface-variant">
                            {coin.titleEn}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Weight */}
                    <td className="py-4 px-4 text-center font-mono font-semibold tabular-nums text-sm">
                      {coin.weightGrams} گرم
                    </td>

                    {/* Karat */}
                    <td className="py-4 px-4 text-center font-mono">
                      {coin.karat === 18 ? '۷۵۰ (۱۸)' : '۹۰۰ (۲۱.۶)'}
                    </td>

                    {/* Intrinsic Value */}
                    <td className="py-4 px-4 text-center font-mono text-on-surface-variant tabular-nums">
                      {formatPrice(coin.intrinsicValueToman || 0, unit, false)}
                    </td>

                    {/* Market Price (Gold) */}
                    <td className="py-4 px-4 text-center font-mono font-black gold-gradient-text text-base tabular-nums">
                      {formatPrice(coin.priceToman, unit, false)}
                    </td>

                    {/* Nominal Bubble Amount */}
                    <td className="py-4 px-4 text-center font-mono text-loss-text font-bold tabular-nums">
                      {formatPrice(coin.bubbleToman || 0, unit, true)}
                    </td>

                    {/* Bubble % */}
                    <td className="py-4 px-4 text-center font-mono font-bold tabular-nums">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] ${
                          isHighRisk
                            ? 'text-loss-text bg-loss-surface border border-loss-border'
                            : isMedRisk
                            ? 'text-bullion-light bg-bullion/15 border border-bullion/30'
                            : 'text-gain-text bg-gain-surface border border-gain-border'
                        }`}
                      >
                        +{bubblePct}٪
                      </span>
                    </td>

                    {/* Risk Badge */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          isHighRisk
                            ? 'bg-loss-surface text-loss-text'
                            : isMedRisk
                            ? 'bg-bullion/10 text-bullion-light'
                            : 'bg-gain-surface text-gain-text'
                        }`}
                      >
                        {isHighRisk ? 'حباب بالا' : isMedRisk ? 'ریسک متعادل' : 'کم‌ریسک (سرمایه‌گذاری)'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => onSelectConverter(coin.symbol)}
                        className="px-3 py-1.5 rounded-xl bg-obsidian-surface hover:bg-bullion hover:text-obsidian text-xs transition-all font-bold active:scale-95 border border-white/[0.06]"
                      >
                        محاسبه
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile Coin Bubble Cards (Visible ONLY on mobile / tablet < 1024px) */}
      <section className="lg:hidden flex flex-col gap-3">
        {coinItems.map((coin) => {
          const bubblePct = coin.bubblePercent || 12;
          const isHighRisk = bubblePct > 20;
          const isMedRisk = bubblePct > 10 && bubblePct <= 20;

          return (
            <div
              key={`mob-${coin.symbol}`}
              className="glass-panel rounded-2xl p-4 flex flex-col gap-3 border border-white/[0.08] shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-bullion/10 border border-bullion/20 flex items-center justify-center text-bullion font-bold">
                    🪙
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-on-surface text-sm">{coin.title}</span>
                    <span className="text-[10px] font-mono text-on-surface-variant">
                      وزن: {coin.weightGrams} گرم • عیار ۹۰۰
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold tabular-nums ${
                    isHighRisk
                      ? 'text-loss-text bg-loss-surface border border-loss-border'
                      : isMedRisk
                      ? 'text-bullion-light bg-bullion/15 border border-bullion/30'
                      : 'text-gain-text bg-gain-surface border border-gain-border'
                  }`}
                >
                  +{bubblePct}٪ حباب
                </span>
              </div>

              {/* Price & Intrinsic Value */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
                <div className="flex flex-col">
                  <span className="text-[11px] text-on-surface-variant">قیمت روز بازار:</span>
                  <span className="text-lg font-black font-mono gold-gradient-text tabular-nums">
                    {formatPrice(coin.priceToman, unit, true)}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] text-on-surface-variant">ارزش طلای خام:</span>
                  <span className="text-sm font-bold font-mono text-on-surface tabular-nums">
                    {formatPrice(coin.intrinsicValueToman || 0, unit, true)}
                  </span>
                </div>
              </div>

              {/* Bubble & Action */}
              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono">
                <span className="text-loss-text">
                  مبلغ حباب: {formatPrice(coin.bubbleToman || 0, unit, true)}
                </span>
                <button
                  onClick={() => onSelectConverter(coin.symbol)}
                  className="px-3 py-1.5 rounded-xl bg-bullion/15 text-bullion-light font-bold border border-bullion/30 text-xs active:scale-95"
                >
                  تبدیل در مبدل
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Official Legal & Union Guidelines */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-bullion-light font-bold text-sm">
            <FileCheck2 className="w-5 h-5 text-bullion" />
            <span>قانون طلای کارکرده (دست دوم)</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            طبق ابلاغیه رسمی وزارت صمت و اتاق اصناف، خرید و فروش طلای دست‌دوم در طلافروشی‌ها با هدف حمایت از تولیدکنندگان محدود شده و حداکثر سود خرید طلای مستعمل ۲ درصد تعیین شده است.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-bullion-light font-bold text-sm">
            <Coins className="w-5 h-5 text-bullion" />
            <span>نشان‌های ضرب قانونی مسکوکات</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            تمامی مسکوکات استاندارد بانکی باید دارای ضرب رسمی بانک مرکزی جمهوری اسلامی ایران با سال ضرب ۱۳۸۶ باشند. سکه‌های ضرب متفرقه فاقد اعتبار معامله بورسی و دارای کسر قیمت هستند.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-gain-text font-bold text-sm">
            <Percent className="w-5 h-5 text-gain" />
            <span>حذف مالیات از اصل طلای خام</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            بر اساس قانون مالیات بر ارزش افزوده جدید، اصل طلای خام و شمش به طور ۱۰۰٪ از پرداخت مالیات ۹ درصد معاف است و مالیات تنها بر مجموع سود فروشنده و اجرت ساخت تعلق می‌گیرد.
          </p>
        </div>
      </section>
    </div>
  );
};
