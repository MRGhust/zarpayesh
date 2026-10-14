'use client';

import React, { useState } from 'react';
import { MarketItem, CurrencyUnit } from '@/types/market';
import { formatPrice, formatPercent } from '@/lib/formatters';
import {
  Gem,
  Coins,
  Scale,
  Calculator,
  AlertTriangle,
  FileCheck2,
  ShieldAlert,
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
  const gold18PriceToman = gold18Item ? gold18Item.priceToman : 4650000;
  const mesghalItem = goldItems.find((g) => g.symbol === 'mesghal');
  const ounceItem = goldItems.find((g) => g.symbol === 'ons');
  const gold24Item = goldItems.find((g) => g.symbol === 'geram24');

  // Official Union Gold Calculation Formula:
  // Raw Gold Value = weight * gold18Price
  // Making Fee Value = rawGoldValue * (makingFeePercent / 100)
  // Seller Profit Value = (rawGoldValue + makingFeeValue) * (sellerProfitPercent / 100)
  // VAT = includeVat ? (makingFeeValue + sellerProfitValue) * 0.09 : 0
  // Total = rawGoldValue + makingFeeValue + sellerProfitValue + VAT
  const rawGoldValue = weightGrams * gold18PriceToman;
  const makingFeeValue = rawGoldValue * (makingFeePercent / 100);
  const sellerProfitValue = (rawGoldValue + makingFeeValue) * (sellerProfitPercent / 100);
  const vatValue = includeVat ? (makingFeeValue + sellerProfitValue) * 0.09 : 0;
  const finalTotalInvoice = rawGoldValue + makingFeeValue + sellerProfitValue + vatValue;

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* 4 Gold Benchmark Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: انس جهانی طلا */}
        <div className="bg-surface-container-low rounded-2xl p-5 border border-white/[0.06] shadow-lg flex items-center justify-between relative overflow-hidden group hover:border-white/[0.12] transition-all">
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-on-surface-variant text-xs font-medium">انس طلا (بازار جهانی XAU)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-primary">
                ${ounceItem ? ounceItem.priceToman.toLocaleString() : '۲,۶۵۴.۸۰'}
              </span>
            </div>
            <span className="text-secondary text-[11px] font-mono flex items-center gap-1">
              <span>+۰.۷۰٪ صعود امروز</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary z-10">
            <Gem className="w-6 h-6" />
          </div>
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Card 2: مظنه مثقال طلا */}
        <div className="bg-surface-container-low rounded-2xl p-5 border border-white/[0.06] shadow-lg flex items-center justify-between relative overflow-hidden group hover:border-white/[0.12] transition-all">
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-on-surface-variant text-xs font-medium">مظنه طلا (مثقال پایه ۱۷ عیار)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-on-surface">
                {mesghalItem ? formatPrice(mesghalItem.priceToman, unit, false) : '۲۰,۱۴۰,۰۰۰'}
              </span>
              <span className="text-on-surface-variant text-xs">{unit === 'toman' ? 'تومان' : 'ریال'}</span>
            </div>
            <span className="text-on-surface-variant/80 text-[11px] font-mono">
              معادل ۴.۶۰۸ گرم طلای ۷۰۵
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-white/[0.08] flex items-center justify-center text-on-surface z-10">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Card 3: طلای ۱۸ عیار خام */}
        <div className="bg-surface-container-low rounded-2xl p-5 border border-white/[0.06] shadow-lg flex items-center justify-between relative overflow-hidden group hover:border-white/[0.12] transition-all">
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-on-surface-variant text-xs font-medium">طلای ۱۸ عیار خام (هر گرم ۷۵۰)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-primary">
                {formatPrice(gold18PriceToman, unit, false)}
              </span>
              <span className="text-on-surface-variant text-xs">{unit === 'toman' ? 'تومان' : 'ریال'}</span>
            </div>
            <span className="text-secondary text-[11px] font-mono flex items-center gap-1">
              <span>+۱.۱۶٪ (+۵۳,۰۰۰ تومان)</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary z-10">
            <Coins className="w-6 h-6" />
          </div>
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Card 4: طلای ۲۴ عیار شمش */}
        <div className="bg-surface-container-low rounded-2xl p-5 border border-white/[0.06] shadow-lg flex items-center justify-between relative overflow-hidden group hover:border-white/[0.12] transition-all">
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-on-surface-variant text-xs font-medium">طلای ۲۴ عیار (هر گرم ۹۹۹)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-on-surface">
                {gold24Item ? formatPrice(gold24Item.priceToman, unit, false) : '۶,۲۰۰,۰۰۰'}
              </span>
              <span className="text-on-surface-variant text-xs">{unit === 'toman' ? 'تومان' : 'ریال'}</span>
            </div>
            <span className="text-on-surface-variant/80 text-[11px] font-mono">
              پایه شمش استاندارد بورس کالا
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary z-10">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-secondary/5 rounded-full blur-xl pointer-events-none"></div>
        </div>
      </section>

      {/* Market Pulse Banner */}
      <section className="bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low rounded-2xl p-4 border border-primary/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">
              رکوردشکنی حباب سکه امامی همزمان با صعود طلای جهانی به کانال ۲۶۵۰ دلار
            </h3>
            <p className="text-xs text-on-surface-variant">
              میانگین حباب مسکوکات در محدوده ۲۸.۴٪ ثبت شد. کم‌ریسک‌ترین سکه: بهار آزادی (۱۳.۵٪) | پرریسک‌ترین: سکه گرمی (۵۱.۵٪)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectConverter('sekee')}
            className="px-3 py-1.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container text-xs font-bold transition-all shadow-md shadow-primary/20"
          >
            محاسبه حباب در مبدل
          </button>
        </div>
      </section>

      {/* Two-Column Section: Correlation Chart (Left) + Invoice Calculator (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Correlation Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-surface-container-low rounded-2xl p-5 border border-white/[0.06] flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-on-surface">
                همبستگی ۳۰ روزه طلای ۱۸ عیار با انس جهانی و دلار
              </h3>
              <p className="text-xs text-on-surface-variant">ضریب همبستگی طلای داخلی با انس جهانی: ۰.۸۹</p>
            </div>
            <div className="flex items-center p-1 bg-surface-container-lowest rounded-xl border border-white/[0.08] text-xs font-mono">
              {(['30D', '3M', '6M', '1Y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-2.5 py-0.5 rounded-lg transition-all ${
                    chartTimeframe === tf
                      ? 'bg-primary-container text-on-primary-container font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Chart SVG Representation */}
          <div className="w-full h-56 relative flex items-center justify-center p-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200">
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffc665" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ffc665" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Horizontal Grid lines */}
              <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="190" x2="600" y2="190" stroke="rgba(255,255,255,0.05)" />

              {/* Gold 18K Area & Line */}
              <path
                d="M 0,160 Q 75,150 150,130 T 300,100 T 450,70 T 600,30 L 600,200 L 0,200 Z"
                fill="url(#goldGrad)"
              />
              <path
                d="M 0,160 Q 75,150 150,130 T 300,100 T 450,70 T 600,30"
                fill="none"
                stroke="#ffc665"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Dollar Reference Line */}
              <path
                d="M 0,170 Q 75,165 150,150 T 300,120 T 450,90 T 600,60"
                fill="none"
                stroke="#4edea3"
                strokeWidth="2"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-primary font-medium">
                <span className="w-3 h-1 bg-primary rounded"></span>
                <span>طلای ۱۸ عیار ایران</span>
              </span>
              <span className="flex items-center gap-1.5 text-secondary font-medium">
                <span className="w-3 h-1 bg-secondary rounded border-dashed"></span>
                <span>دلار آزاد فردوسی</span>
              </span>
            </div>
            <span className="text-on-surface-variant/70 text-[11px] font-mono">
              بازار صعودی با شیب موزون
            </span>
          </div>
        </div>

        {/* Right: Gold Invoice Calculator (5 Cols) */}
        <div className="lg:col-span-5 bg-surface-container-low rounded-2xl p-5 border border-white/[0.06] flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold text-on-surface">محاسبه‌گر رسمی فاکتور طلا و زیورآلات</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              فرمول اتحادیه
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Weight */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-on-surface-variant">وزن طلا (گرم):</span>
                <span className="font-mono font-bold text-primary">{weightGrams} گرم</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="50"
                step="0.25"
                value={weightGrams}
                onChange={(e) => setWeightGrams(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Making Fee */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-on-surface-variant">اجرت ساخت سازنده (%):</span>
                <span className="font-mono font-bold text-on-surface">{makingFeePercent}٪</span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={makingFeePercent}
                onChange={(e) => setMakingFeePercent(parseInt(e.target.value, 10))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Profit & VAT Toggle */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="block text-on-surface-variant text-[11px] mb-1">سود قانونی فروشنده</span>
                <div className="p-2 bg-surface-container rounded-xl font-mono text-center font-bold text-on-surface">
                  ۷٪ مصوب
                </div>
              </div>
              <div>
                <span className="block text-on-surface-variant text-[11px] mb-1">مالیات ۹٪ (فقط اجرت و سود)</span>
                <button
                  type="button"
                  onClick={() => setIncludeVat(!includeVat)}
                  className={`w-full p-2 rounded-xl text-center font-bold transition-all flex items-center justify-center gap-1 ${
                    includeVat
                      ? 'bg-primary-container text-on-primary-container shadow-sm'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {includeVat ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{includeVat ? 'محاسبه شود' : 'بدون مالیات'}</span>
                </button>
              </div>
            </div>

            {/* Invoice Breakdown Results */}
            <div className="mt-3 p-3.5 rounded-xl bg-surface-container border border-white/[0.06] space-y-2 font-mono text-xs">
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
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between font-bold text-sm">
                <span className="text-primary">مبلغ نهایی پرداختی:</span>
                <span className="text-primary">{formatPrice(finalTotalInvoice, unit, true)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sovereign Coin Matrix & Bubble Table */}
      <section className="bg-surface-container-low rounded-2xl border border-white/[0.06] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-on-surface">
              ماتریس حباب مسکوکات بانکی و ارزش ذاتی طلا
            </h2>
            <p className="text-xs text-on-surface-variant">
              بررسی تفاوت قیمت بازار با ارزش شمش طلای موجود در سکه بر اساس عیار قانونی ۹۰۰
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-surface-container text-primary font-bold">
            BUBBLE TRACKER
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-lowest/60 text-on-surface-variant border-b border-white/[0.06] font-semibold">
                <th className="py-3 px-4">نام مسکوک قانونی</th>
                <th className="py-3 px-4 text-center">وزن قانونی (گرم)</th>
                <th className="py-3 px-4 text-center">عیار</th>
                <th className="py-3 px-4 text-center">ارزش ذاتی طلا</th>
                <th className="py-3 px-4 text-center">قیمت روز بازار</th>
                <th className="py-3 px-4 text-center">مبلغ اسمی حباب</th>
                <th className="py-3 px-4 text-center">درصد حباب</th>
                <th className="py-3 px-4 text-center">وضعیت ریسک</th>
                <th className="py-3 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {coinItems.map((coin) => {
                const bubblePct = coin.bubblePercent || 20;
                const isHighRisk = bubblePct > 40;
                const isMedRisk = bubblePct > 20 && bubblePct <= 40;

                return (
                  <tr
                    key={coin.symbol}
                    className="hover:bg-surface-container-high/60 transition-colors group"
                  >
                    {/* Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                          🪙
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors">
                            {coin.title}
                          </span>
                          <span className="text-[11px] font-mono text-on-surface-variant">
                            {coin.titleEn}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Weight */}
                    <td className="py-3.5 px-4 text-center font-mono font-medium">
                      {coin.weightGrams} گرم
                    </td>

                    {/* Karat */}
                    <td className="py-3.5 px-4 text-center font-mono">
                      {coin.karat === 18 ? '۷۵۰ (۱۸)' : '۹۰۰ (۲۱.۶)'}
                    </td>

                    {/* Intrinsic Value */}
                    <td className="py-3.5 px-4 text-center font-mono text-on-surface-variant">
                      {formatPrice(coin.intrinsicValueToman || 0, unit, false)}
                    </td>

                    {/* Market Price (Gold) */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-primary text-sm">
                      {formatPrice(coin.priceToman, unit, false)}
                    </td>

                    {/* Nominal Bubble Amount */}
                    <td className="py-3.5 px-4 text-center font-mono text-error font-medium">
                      {formatPrice(coin.bubbleToman || 0, unit, true)}
                    </td>

                    {/* Bubble % */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] ${
                          isHighRisk
                            ? 'text-error bg-error/15 border border-error/30'
                            : isMedRisk
                            ? 'text-primary bg-primary/15 border border-primary/30'
                            : 'text-secondary bg-secondary/15 border border-secondary/30'
                        }`}
                      >
                        +{bubblePct}٪
                      </span>
                    </td>

                    {/* Risk Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
                          isHighRisk
                            ? 'bg-error/10 text-error'
                            : isMedRisk
                            ? 'bg-primary/10 text-primary'
                            : 'bg-secondary/10 text-secondary'
                        }`}
                      >
                        {isHighRisk ? 'حباب بالا (پرریسک)' : isMedRisk ? 'ریسک متوسط' : 'کم‌ریسک (امن)'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onSelectConverter(coin.symbol)}
                        className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container text-xs transition-all font-medium"
                      >
                        محاسبه تبدیل
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Official Legal & Union Guidelines */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-low rounded-2xl p-5 border border-white/[0.06] flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <FileCheck2 className="w-5 h-5" />
            <span>قانون طلای کارکرده (دست دوم)</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            طبق ابلاغیه رسمی وزارت صمت و اتاق اصناف، خرید و فروش طلای دست‌دوم در طلافروشی‌ها با هدف حمایت از تولیدکنندگان محدود شده و حداکثر سود خرید طلای مستعمل ۲ درصد تعیین شده است.
          </p>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-5 border border-white/[0.06] flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Coins className="w-5 h-5" />
            <span>نشان‌های ضرب قانونی مسکوکات</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            تمامی مسکوکات استاندارد بانکی باید دارای ضرب رسمی بانک مرکزی جمهوری اسلامی ایران با سال ضرب ۱۳۸۶ باشند. سکه‌های ضرب متفرقه فاقد اعتبار معامله بورسی و دارای کسر قیمت هستند.
          </p>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-5 border border-white/[0.06] flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-secondary font-bold text-sm">
            <Percent className="w-5 h-5" />
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
