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
  SlidersHorizontal,
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
        priceToman: Math.round(item.priceToman * 0.76),
        priceRial: Math.round(item.priceRial * 0.76),
      };
    }
    if (selectedRegime === 'nima') {
      return {
        priceToman: Math.round(item.priceToman * 0.75),
        priceRial: Math.round(item.priceRial * 0.75),
      };
    }
    return {
      priceToman: item.priceToman,
      priceRial: item.priceRial,
    };
  };

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* 4 Macro Stat Counters (Responsive Grid: 1 col on mobile, 2 col on tablet, 4 on desktop) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: شاخص کلی ارز آزاد */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 flex items-center justify-between relative overflow-hidden group transition-all">
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-on-surface-variant text-xs font-medium">شاخص کل نوسان روزانه ارز</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-gain-text tabular-nums">
                +{macro.dailyVolatilityPercent}٪
              </span>
              <span className="text-gain-text text-[11px] font-bold">صعودی</span>
            </div>
            <span className="text-on-surface-variant/70 text-[11px]">
              حجم تخمینی: {macro.estimatedVolumeUsd}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gain-surface border border-gain-border flex items-center justify-center text-gain-text z-10 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: میانگین سنا */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 flex items-center justify-between relative overflow-hidden group transition-all">
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-on-surface-variant text-xs font-medium">میانگین اسکناس صرافی ملی (سنا)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono gold-gradient-text tabular-nums">
                {formatPrice(macro.sanaAverageToman, unit, false)}
              </span>
              <span className="text-on-surface-variant text-xs">{unit === 'toman' ? 'تومان' : 'ریال'}</span>
            </div>
            <span className="text-gain-text text-[11px] flex items-center gap-1 font-mono">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>نرخ حواله و مصارف ضروری</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-bullion/10 border border-bullion/20 flex items-center justify-center text-bullion-light z-10 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Landmark className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: میانگین حواله نیما */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 flex items-center justify-between relative overflow-hidden group transition-all">
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-on-surface-variant text-xs font-medium">میانگین سامانه نیما (حواله)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-on-surface tabular-nums">
                {formatPrice(macro.nimaAverageToman, unit, false)}
              </span>
              <span className="text-on-surface-variant text-xs">{unit === 'toman' ? 'تومان' : 'ریال'}</span>
            </div>
            <span className="text-on-surface-variant/80 text-[11px] font-mono">
              پایه واردات مواد اولیه و صنایع
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-surface-bright border border-white/[0.08] flex items-center justify-center text-primary z-10">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: شکاف آربیتراژ آزاد / نیما */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 flex items-center justify-between relative overflow-hidden group transition-all">
          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-on-surface-variant text-xs font-medium">شکاف آربیتراژ آزاد / نیما</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-loss-text tabular-nums">
                {macro.nimaFreeSpreadPercent}٪
              </span>
              <span className="text-loss-text text-xs font-bold">فاصله قیمتی</span>
            </div>
            <span className="text-on-surface-variant/80 text-[11px] font-mono">
              معادل {formatPrice(macro.nimaFreeSpreadToman, unit, true)} در دلار
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-loss-surface border border-loss-border flex items-center justify-center text-loss-text z-10 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
            <GitCompare className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Filter and Segmentation Controls */}
      <section className="glass-panel rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Region Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-on-surface-variant text-xs hidden lg:inline ml-2 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-bullion" />
            <span>دسته‌بندی:</span>
          </span>
          {[
            { id: 'all', label: 'همه ارزها' },
            { id: 'major', label: 'ارزهای اصلی' },
            { id: 'middle-east', label: 'خلیج‌فارس و منطقه' },
            { id: 'cis-europe', label: 'CIS و اروپا' },
            { id: 'east-asia', label: 'شرق آسیا' },
          ].map((reg) => (
            <button
              key={reg.id}
              onClick={() => setSelectedRegion(reg.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                selectedRegion === reg.id
                  ? 'gold-gradient-btn'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/[0.05]'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>

        {/* Rate Regimes: Free Market / Sana / Nima */}
        <div className="flex items-center p-1 bg-obsidian-950 rounded-xl border border-white/[0.08] self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setSelectedRegime('free')}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
              selectedRegime === 'free'
                ? 'gold-gradient-btn'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            بازار آزاد
          </button>
          <button
            onClick={() => setSelectedRegime('sana')}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
              selectedRegime === 'sana'
                ? 'gold-gradient-btn'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            سنا (بانکی)
          </button>
          <button
            onClick={() => setSelectedRegime('nima')}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
              selectedRegime === 'nima'
                ? 'gold-gradient-btn'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            نیما (حواله)
          </button>
        </div>
      </section>

      {/* Desktop Table View (Hidden on mobile < 1024px) */}
      <section className="hidden lg:block glass-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-on-surface flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-bullion"></span>
              <span>مظنه زنده اسکناس و نقدی ارزهای مرجع</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              استخراج مستقیم از هسته داده TGJU و صرافی‌های مجاز بانکی فردوسی و دبی
            </p>
          </div>
          <span className="text-xs font-mono text-on-surface-variant bg-obsidian-950 px-3 py-1 rounded-full border border-white/[0.06]">
            نمادهای فعال: {filteredItems.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-obsidian-950/70 text-on-surface-variant border-b border-white/[0.06] font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-5">ارز و نماد بین‌المللی</th>
                <th className="py-3.5 px-4 text-center">خرید صرافی</th>
                <th className="py-3.5 px-4 text-center">فروش (مظنه بازار)</th>
                <th className="py-3.5 px-4 text-center">ارزش برابری ریالی</th>
                <th className="py-3.5 px-4 text-center">تغییر ۲۴س</th>
                <th className="py-3.5 px-4 text-center">دامنه نوسان امروز</th>
                <th className="py-3.5 px-4 text-center">روند ۷ روزه</th>
                <th className="py-3.5 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredItems.map((item) => {
                const { priceToman: adjustedToman } = getRegimeAdjustedPrice(item);
                const { text: pctText, isPositive, isNeutral } = formatPercent(item.changePercent);

                return (
                  <tr
                    key={item.symbol}
                    className="hover:bg-obsidian-surface/60 transition-colors group"
                  >
                    {/* Currency & Flag */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3.5">
                        {item.flagCode ? (
                          <img
                            src={`https://flagcdn.com/w40/${item.flagCode}.png`}
                            alt={item.title}
                            className="w-8 h-5.5 rounded-md object-cover shadow-md border border-white/[0.12] group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-8 h-5.5 rounded-md bg-obsidian-surface border border-white/[0.1] flex items-center justify-center font-mono text-[9px] font-bold text-bullion">
                            {item.symbol.slice(6, 9).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-extrabold text-on-surface text-sm group-hover:text-bullion-light transition-colors">
                            {item.title}
                          </span>
                          <span className="text-[11px] font-mono text-on-surface-variant font-medium">
                            {item.titleEn} ({item.symbol.replace('price_', '').toUpperCase()})
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Buy Price */}
                    <td className="py-4 px-4 text-center font-mono text-on-surface-variant font-semibold tabular-nums text-sm">
                      {formatPrice(Math.round(adjustedToman * 0.995), unit, false)}
                    </td>

                    {/* Sell Price (Bold Gold) */}
                    <td className="py-4 px-4 text-center font-mono font-black gold-gradient-text text-base tabular-nums">
                      {formatPrice(adjustedToman, unit, false)}
                    </td>

                    {/* Rial Value */}
                    <td className="py-4 px-4 text-center font-mono text-on-surface-variant text-[11px] tabular-nums">
                      {formatPrice(adjustedToman, 'rial', true)}
                    </td>

                    {/* 24h Change Badge */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[11px] font-bold tabular-nums ${
                          isNeutral
                            ? 'text-on-surface-variant bg-white/[0.05]'
                            : isPositive
                            ? 'text-gain-text bg-gain-surface border border-gain-border'
                            : 'text-loss-text bg-loss-surface border border-loss-border'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : isNeutral ? null : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>{pctText}</span>
                      </span>
                    </td>

                    {/* Low / High */}
                    <td className="py-4 px-4 text-center font-mono text-[11px] tabular-nums">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-gain-text font-semibold">
                          سقف: {formatPrice(item.highToman, unit, false)}
                        </span>
                        <span className="text-loss-text font-semibold">
                          کف: {formatPrice(item.lowToman, unit, false)}
                        </span>
                      </div>
                    </td>

                    {/* 7-day Sparkline SVG */}
                    <td className="py-4 px-4 text-center">
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
                                <polyline
                                  fill="none"
                                  stroke={isPositive ? '#10b981' : '#f43f5e'}
                                  strokeWidth="2.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  points={points}
                                />
                              );
                            })()}
                          </svg>
                        ) : (
                          <span className="text-outline text-[10px]">--</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={onOpenAlertModal}
                          className="p-2 rounded-xl text-on-surface-variant hover:text-bullion hover:bg-bullion/10 border border-white/[0.04] hover:border-bullion/30 transition-all active:scale-95"
                          title="تنظیم هشدار"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSelectConverter(item.symbol)}
                          className="p-2 rounded-xl text-on-surface-variant hover:text-bullion hover:bg-bullion/10 border border-white/[0.04] hover:border-bullion/30 transition-all active:scale-95"
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

      {/* Mobile-First Trading Cards (Visible ONLY on mobile / tablet < 1024px) */}
      <section className="lg:hidden flex flex-col gap-3">
        {filteredItems.map((item) => {
          const { priceToman: adjustedToman } = getRegimeAdjustedPrice(item);
          const { text: pctText, isPositive, isNeutral } = formatPercent(item.changePercent);

          return (
            <div
              key={`mob-${item.symbol}`}
              className="glass-panel rounded-2xl p-4 flex flex-col gap-3 border border-white/[0.08] shadow-lg active:border-bullion/40 transition-all"
            >
              {/* Header: Flag, Name, Percent Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.flagCode ? (
                    <img
                      src={`https://flagcdn.com/w40/${item.flagCode}.png`}
                      alt={item.title}
                      className="w-8 h-5.5 rounded object-cover border border-white/[0.1]"
                    />
                  ) : (
                    <div className="w-8 h-5.5 rounded bg-obsidian-surface border border-white/[0.1] flex items-center justify-center font-mono text-[9px] font-bold text-bullion">
                      {item.symbol.slice(6, 9).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-extrabold text-on-surface text-sm">{item.title}</span>
                    <span className="text-[10px] font-mono text-on-surface-variant">
                      {item.titleEn}
                    </span>
                  </div>
                </div>

                {/* 24h Change Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[11px] font-bold tabular-nums ${
                    isNeutral
                      ? 'text-on-surface-variant bg-white/[0.05]'
                      : isPositive
                      ? 'text-gain-text bg-gain-surface border border-gain-border'
                      : 'text-loss-text bg-loss-surface border border-loss-border'
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : isNeutral ? null : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  <span>{pctText}</span>
                </span>
              </div>

              {/* Price Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] items-center">
                <div className="flex flex-col">
                  <span className="text-[11px] text-on-surface-variant">قیمت فروش بازار:</span>
                  <span className="text-xl font-black font-mono gold-gradient-text tabular-nums">
                    {formatPrice(adjustedToman, unit, true)}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] text-on-surface-variant">قیمت خرید:</span>
                  <span className="text-sm font-bold font-mono text-on-surface tabular-nums">
                    {formatPrice(Math.round(adjustedToman * 0.995), unit, true)}
                  </span>
                </div>
              </div>

              {/* Low / High Bar & Actions */}
              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
                <div className="flex items-center gap-3">
                  <span>
                    کف: <span className="text-loss-text">{formatPrice(item.lowToman, unit, false)}</span>
                  </span>
                  <span>
                    سقف: <span className="text-gain-text">{formatPrice(item.highToman, unit, false)}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectConverter(item.symbol)}
                    className="px-3 py-1.5 rounded-xl bg-bullion/15 text-bullion-light font-bold text-xs border border-bullion/30 active:scale-95"
                  >
                    تبدیل ارز
                  </button>
                  <button
                    onClick={onOpenAlertModal}
                    className="p-1.5 rounded-xl bg-obsidian-card border border-white/[0.08] text-on-surface-variant hover:text-bullion"
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Nima Arbitrage Spread Analysis & Volatility */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Nima Spread Bars (8 Cols) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-on-surface">شکاف قیمت حواله نیما در برابر بازار آزاد</h3>
              <p className="text-xs text-on-surface-variant">
                نرخ تخصیص ارزهای تجاری به واردکنندگان در مقایسه با نرخ اسکناس غیررسمی
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-bullion/10 border border-bullion/20 text-bullion-light font-bold">
              ARBITRAGE
            </span>
          </div>

          <div className="space-y-4">
            {[
              {
                title: 'دلار آمریکا (USD)',
                free: 263900,
                nima: 198500,
                gapPct: 24.8,
              },
              {
                title: 'درهم امارات (AED)',
                free: 72202,
                nima: 54300,
                gapPct: 24.8,
              },
              {
                title: 'یورو اروپا (EUR)',
                free: 294330,
                nima: 221200,
                gapPct: 24.8,
              },
              {
                title: 'یوان چین (CNY)',
                free: 39600,
                nima: 29800,
                gapPct: 24.7,
              },
            ].map((sp) => {
              return (
                <div key={sp.title} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-on-surface">{sp.title}</span>
                    <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums">
                      <span className="text-on-surface-variant">
                        نیما: {formatPrice(sp.nima, unit, true)}
                      </span>
                      <span className="text-bullion-light font-bold">
                        آزاد: {formatPrice(sp.free, unit, true)}
                      </span>
                      <span className="text-loss-text font-bold">+{sp.gapPct}٪ شکاف</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-obsidian-950 rounded-full overflow-hidden flex border border-white/[0.06]">
                    <div
                      className="h-full bg-secondary-container"
                      style={{ width: `${100 - sp.gapPct}%` }}
                      title="پوشش نیما"
                    ></div>
                    <div
                      className="h-full bg-loss"
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
        <div className="lg:col-span-4 glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-on-surface mb-1">میانگین هفتگی نوسانات (۷ روز اخیر)</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              دامنه‌های کف و سقف هیجانی قیمت در بازار فردوسی
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-obsidian-card border border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">بیشترین جهش روزانه</span>
                <span className="font-mono font-bold text-gain-text tabular-nums">+۲.۸۲٪ (درهم امارات)</span>
              </div>
              <div className="p-3 rounded-xl bg-obsidian-card border border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">نرخ گریونا اوکراین</span>
                <span className="font-mono font-bold text-bullion-light tabular-nums">۵,۴۵۰ تومان</span>
              </div>
              <div className="p-3 rounded-xl bg-obsidian-card border border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">دامنه نوسان دلار</span>
                <span className="font-mono font-bold text-on-surface tabular-nums">۴,۴۱۰ تومان امروز</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-bullion/10 border border-bullion/20 flex items-start gap-2 text-xs text-on-surface">
            <Info className="w-4 h-4 text-bullion shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-on-surface-variant">
              با توجه به تثبیت نرخ حواله در سامانه معاملات الکترونیکی، بخش عمده نوسانات معطوف به تغییرات متغیرهای سیاسی و تقاضای سفر پاییزه است.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
