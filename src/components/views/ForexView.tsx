'use client';

import React, { useState, useMemo } from 'react';
import { MarketItem, CurrencyUnit, RateRegime } from '@/types/market';
import { formatPrice, formatPercent } from '@/lib/formatters';
import {
  TrendingUp,
  Landmark,
  Building2,
  GitCompare,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  ArrowLeftRight,
  Info,
} from 'lucide-react';

interface ForexViewProps {
  items: MarketItem[];
  unit: CurrencyUnit;
  onSelectConverter: (symbol: string) => void;
  onOpenAlertModal: () => void;
  macro: {
    dailyVolatilityPercent: number;
    estimatedVolumeUsd: string;
    sanaAverageToman: number;
    nimaAverageToman: number;
    nimaFreeSpreadPercent: number;
    nimaFreeSpreadToman: number;
  };
  searchQuery: string;
}

export const ForexView: React.FC<ForexViewProps> = ({
  items,
  unit,
  onSelectConverter,
  onOpenAlertModal,
  macro,
  searchQuery,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedRegime, setSelectedRegime] = useState<RateRegime>('free');

  // Filter items by search and region
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.title.toLowerCase().includes(q);
        const matchesEn = item.titleEn.toLowerCase().includes(q);
        const matchesCode = item.symbol.toLowerCase().includes(q);
        if (!matchesName && !matchesEn && !matchesCode) return false;
      }
      // Region filter
      if (selectedRegion === 'all') return true;
      return item.category === selectedRegion;
    });
  }, [items, searchQuery, selectedRegion]);

  // Adjust prices based on regime (Sana/Nima)
  const getRegimeAdjustedPrice = (item: MarketItem) => {
    if (selectedRegime === 'sana') {
      return {
        priceToman: Math.round(item.priceToman * 0.74),
        priceRial: Math.round(item.priceRial * 0.74),
      };
    }
    if (selectedRegime === 'nima') {
      return {
        priceToman: Math.round(item.priceToman * 0.71),
        priceRial: Math.round(item.priceRial * 0.71),
      };
    }
    return {
      priceToman: item.priceToman,
      priceRial: item.priceRial,
    };
  };

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* 4 Macro Stat Counters */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: شاخص کلی ارز آزاد */}
        <div className="bg-surface-container-low rounded-2xl p-5 border border-white/[0.06] shadow-lg flex items-center justify-between relative overflow-hidden group hover:border-white/[0.12] transition-all">
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-on-surface-variant text-xs font-medium">شاخص کل نوسان روزانه ارز</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-on-surface">
                +{macro.dailyVolatilityPercent}٪
              </span>
              <span className="text-secondary text-xs font-semibold">روند صعودی ملایم</span>
            </div>
            <span className="text-on-surface-variant/70 text-[11px]">
              حجم برآوردی: {macro.estimatedVolumeUsd}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary z-10">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-secondary/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Card 2: میانگین سنا */}
        <div className="bg-surface-container-low rounded-2xl p-5 border border-white/[0.06] shadow-lg flex items-center justify-between relative overflow-hidden group hover:border-white/[0.12] transition-all">
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-on-surface-variant text-xs font-medium">میانگین اسکناس صرافی ملی (سنا)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-primary">
                {formatPrice(macro.sanaAverageToman, unit, false)}
              </span>
              <span className="text-on-surface-variant text-xs">{unit === 'toman' ? 'تومان' : 'ریال'}</span>
            </div>
            <span className="text-secondary text-[11px] flex items-center gap-1 font-mono">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+۰.۰۸٪ نوسان آخرین پارت</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary z-10">
            <Landmark className="w-6 h-6" />
          </div>
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Card 3: میانگین حواله نیما */}
        <div className="bg-surface-container-low rounded-2xl p-5 border border-white/[0.06] shadow-lg flex items-center justify-between relative overflow-hidden group hover:border-white/[0.12] transition-all">
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-on-surface-variant text-xs font-medium">میانگین حواله نیما (رسمی)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-on-surface">
                {formatPrice(macro.nimaAverageToman, unit, false)}
              </span>
              <span className="text-on-surface-variant text-xs">{unit === 'toman' ? 'تومان' : 'ریال'}</span>
            </div>
            <span className="text-on-surface-variant/70 text-[11px] flex items-center gap-1 font-mono">
              <span>نرخ پایه تخصیص بازرگانی</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary-container/20 border border-secondary-container/30 flex items-center justify-center text-secondary z-10">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-secondary-container/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Card 4: شکاف اسپرد آزاد / نیما */}
        <div className="bg-surface-container-low rounded-2xl p-5 border border-white/[0.06] shadow-lg flex items-center justify-between relative overflow-hidden group hover:border-white/[0.12] transition-all">
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-on-surface-variant text-xs font-medium">شکاف آربیتراژ آزاد / نیما</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-error">
                {macro.nimaFreeSpreadPercent}٪
              </span>
              <span className="text-error text-xs font-semibold">اختلاف اسپرد</span>
            </div>
            <span className="text-on-surface-variant/80 text-[11px] font-mono">
              معادل {formatPrice(macro.nimaFreeSpreadToman, unit, true)} در هر دلار
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center text-error z-10">
            <GitCompare className="w-6 h-6" />
          </div>
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-error/5 rounded-full blur-xl pointer-events-none"></div>
        </div>
      </section>

      {/* Filter and Segmentation Controls */}
      <section className="bg-surface-container-low rounded-2xl p-4 border border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
        {/* Regions */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'همه ارزها' },
            { id: 'major', label: 'ارزهای اصلی' },
            { id: 'middle-east', label: 'خاورمیانه و خلیج‌فارس' },
            { id: 'cis-europe', label: 'CIS و شرق اروپا' },
            { id: 'east-asia', label: 'آسیای شرقی' },
          ].map((reg) => (
            <button
              key={reg.id}
              onClick={() => setSelectedRegion(reg.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                selectedRegion === reg.id
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>

        {/* Rate Regimes: Free Market / Sana / Nima */}
        <div className="flex items-center p-1 bg-surface-container-lowest rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setSelectedRegime('free')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
              selectedRegime === 'free'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            بازار آزاد
          </button>
          <button
            onClick={() => setSelectedRegime('sana')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
              selectedRegime === 'sana'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            سنا (بانکی)
          </button>
          <button
            onClick={() => setSelectedRegime('nima')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
              selectedRegime === 'nima'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            نیما (حواله)
          </button>
        </div>
      </section>

      {/* Master Forex Table */}
      <section className="bg-surface-container-low rounded-2xl border border-white/[0.06] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-on-surface">مظنه زنده اسکناس و نقدی ارزهای مرجع</h2>
            <p className="text-xs text-on-surface-variant">
              نرخ‌های تجمیعی مستقیم از TGJU و صرافی‌های مجاز بانکی (به‌روزرسانی لحظه‌ای)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant font-mono">
              تعداد نمادها: {filteredItems.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-lowest/60 text-on-surface-variant border-b border-white/[0.06] font-semibold">
                <th className="py-3 px-4">ارز و نماد</th>
                <th className="py-3 px-4 text-center">خرید</th>
                <th className="py-3 px-4 text-center">فروش (مظنه بازار)</th>
                <th className="py-3 px-4 text-center">ارزش برابری ریالی</th>
                <th className="py-3 px-4 text-center">تغییر ۲۴ ساعته</th>
                <th className="py-3 px-4 text-center">کمترین / بیشترین</th>
                <th className="py-3 px-4 text-center">روند ۷ روز اخیر</th>
                <th className="py-3 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredItems.map((item) => {
                const { priceToman: adjustedToman, priceRial: adjustedRial } =
                  getRegimeAdjustedPrice(item);
                const { text: pctText, isPositive, isNeutral } = formatPercent(item.changePercent);

                return (
                  <tr
                    key={item.symbol}
                    className="hover:bg-surface-container-high/60 transition-colors group"
                  >
                    {/* Currency & Flag */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {item.flagCode ? (
                          <img
                            src={`https://flagcdn.com/w40/${item.flagCode}.png`}
                            alt={item.title}
                            className="w-7 h-5 rounded object-cover shadow-sm border border-white/[0.1]"
                          />
                        ) : (
                          <div className="w-7 h-5 rounded bg-surface-container-highest flex items-center justify-center font-mono text-[9px]">
                            {item.symbol.slice(6, 9).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors">
                            {item.title}
                          </span>
                          <span className="text-[11px] font-mono text-on-surface-variant">
                            {item.titleEn} ({item.symbol.replace('price_', '').toUpperCase()})
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Buy Price */}
                    <td className="py-3.5 px-4 text-center font-mono text-on-surface-variant font-medium">
                      {formatPrice(Math.round(adjustedToman * 0.995), unit, false)}
                    </td>

                    {/* Sell Price (Bold Gold) */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-primary text-sm">
                      {formatPrice(adjustedToman, unit, false)}
                    </td>

                    {/* Rial Value */}
                    <td className="py-3.5 px-4 text-center font-mono text-on-surface-variant text-[11px]">
                      {formatPrice(adjustedToman, 'rial', true)}
                    </td>

                    {/* 24h Change Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold ${
                          isNeutral
                            ? 'text-on-surface-variant bg-surface-variant'
                            : isPositive
                            ? 'text-secondary bg-secondary/15 border border-secondary/25'
                            : 'text-error bg-error/15 border border-error/25'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : isNeutral ? null : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        <span>{pctText}</span>
                      </span>
                    </td>

                    {/* Low / High */}
                    <td className="py-3.5 px-4 text-center font-mono text-[11px] text-on-surface-variant">
                      <div className="flex flex-col items-center">
                        <span className="text-secondary/90">
                          {formatPrice(item.highToman, unit, false)}
                        </span>
                        <span className="text-error/90">
                          {formatPrice(item.lowToman, unit, false)}
                        </span>
                      </div>
                    </td>

                    {/* 7-day Sparkline SVG */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="w-24 h-7 mx-auto flex items-center justify-center">
                        {item.sparkline && item.sparkline.length > 0 ? (
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
                            {(() => {
                              const min = Math.min(...item.sparkline);
                              const max = Math.max(...item.sparkline);
                              const range = max - min || 1;
                              const points = item.sparkline
                                .map((val, idx) => {
                                  const x = (idx / (item.sparkline!.length - 1)) * 100;
                                  const y = 28 - ((val - min) / range) * 24;
                                  return `${x},${y}`;
                                })
                                .join(' ');
                              return (
                                <>
                                  <polyline
                                    fill="none"
                                    stroke={isPositive ? '#4edea3' : '#ffb4ab'}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={points}
                                  />
                                </>
                              );
                            })()}
                          </svg>
                        ) : (
                          <span className="text-outline text-[10px]">بدون داده</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={onOpenAlertModal}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-all"
                          title="تنظیم هشدار"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSelectConverter(item.symbol)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-all"
                          title="انتقال به مبدل ارز"
                        >
                          <ArrowLeftRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Nima Arbitrage Spread Analysis & Volatility */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Nima Spread Bars (8 Cols) */}
        <div className="lg:col-span-8 bg-surface-container-low rounded-2xl p-5 border border-white/[0.06] flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-on-surface">شکاف قیمت حواله نیما در برابر بازار آزاد</h3>
              <p className="text-xs text-on-surface-variant">
                نرخ تخصیص ارزهای تجاری به واردکنندگان در مقایسه با نرخ اسکناس غیررسمی
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">
              SPREAD INDEX
            </span>
          </div>

          <div className="space-y-4">
            {[
              {
                title: 'دلار آمریکا (USD)',
                free: 68450,
                nima: 48900,
                gapPct: 28.5,
              },
              {
                title: 'درهم امارات (AED)',
                free: 18650,
                nima: 13320,
                gapPct: 28.6,
              },
              {
                title: 'یورو اروپا (EUR)',
                free: 74600,
                nima: 53200,
                gapPct: 28.7,
              },
              {
                title: 'یوان چین (CNY)',
                free: 9450,
                nima: 6800,
                gapPct: 28.0,
              },
            ].map((sp) => {
              return (
                <div key={sp.title} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-on-surface">{sp.title}</span>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-on-surface-variant">
                        نیما: {formatPrice(sp.nima, unit, true)}
                      </span>
                      <span className="text-primary font-bold">
                        آزاد: {formatPrice(sp.free, unit, true)}
                      </span>
                      <span className="text-error font-bold">+{sp.gapPct}٪ شکاف</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-secondary-container"
                      style={{ width: `${100 - sp.gapPct}%` }}
                      title="پوشش نیما"
                    ></div>
                    <div
                      className="h-full bg-error"
                      style={{ width: `${sp.gapPct}%` }}
                      title="شکاف ریسک بازار آزاد"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Volatility Summary (4 Cols) */}
        <div className="lg:col-span-4 bg-surface-container-low rounded-2xl p-5 border border-white/[0.06] flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-on-surface mb-1">میانگین هفتگی نوسانات (۷ روز اخیر)</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              دامنه‌های کف و سقف هیجانی قیمت در بازار فردوسی
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-surface-container border border-white/[0.04] flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">بیشترین جهش هفتگی</span>
                <span className="font-mono font-bold text-secondary">+۲.۱۰٪ (لیر ترکیه)</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container border border-white/[0.04] flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">کمترین نوسان</span>
                <span className="font-mono font-bold text-on-surface">۰.۰۰٪ (گریونا اوکراین)</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container border border-white/[0.04] flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">انحراف معیار دلار</span>
                <span className="font-mono font-bold text-primary">۴۲۰ تومان (ثبات نسبی)</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-2 text-xs text-on-surface">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-on-surface-variant">
              با توجه به تثبیت نرخ حواله در سامانه معاملات الکترونیکی، بخش عمده نوسانات معطوف به تغییرات متغیرهای سیاسی و تقاضای سفر پاییزه است.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
