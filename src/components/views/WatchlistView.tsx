'use client';

import React, { useState } from 'react';
import { MarketItem, CurrencyUnit } from '@/types/market';
import { formatPrice, formatPercent } from '@/lib/formatters';
import {
  TrendingUp,
  Activity,
  CandlestickChart,
  LineChart as LineChartIcon,
  ArrowRightLeft,
  Compass,
  Newspaper,
  Zap,
} from 'lucide-react';

interface WatchlistViewProps {
  forexItems: MarketItem[];
  goldItems: MarketItem[];
  coinItems: MarketItem[];
  unit: CurrencyUnit;
  onSelectConverter: (symbol: string) => void;
  onOpenAlertModal: () => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  forexItems,
  goldItems,
  coinItems,
  unit,
  onSelectConverter,
}) => {
  const [timeframe, setTimeframe] = useState<'1H' | '1D' | '1W' | '1M' | '1Y'>('1D');
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');

  // Quick converter inside sidebar
  const [quickAmount, setQuickAmount] = useState<number>(100);
  const [quickSource, setQuickSource] = useState<string>('price_dollar_rl');

  const dollarItem = forexItems.find((f) => f.symbol === 'price_dollar_rl');
  const euroItem = forexItems.find((f) => f.symbol === 'price_eur');
  const gold18Item = goldItems.find((g) => g.symbol === 'geram18');
  const coinEmamiItem = coinItems.find((c) => c.symbol === 'sekee');

  // Quick calculate
  const sourceRate = forexItems.find((f) => f.symbol === quickSource)?.priceToman || 263900;
  const quickResultToman = quickAmount * sourceRate;

  // High-demand items for the watchlist table
  const watchlistItems = [
    dollarItem,
    euroItem,
    forexItems.find((f) => f.symbol === 'price_aed'),
    forexItems.find((f) => f.symbol === 'price_try'),
    forexItems.find((f) => f.symbol === 'price_uah'),
    gold18Item,
    coinEmamiItem,
  ].filter(Boolean) as MarketItem[];

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* Top Protocol Status Bar */}
      <section className="glass-panel rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-on-surface-variant flex items-center gap-1.5 shrink-0">
            <Activity className="w-3.5 h-3.5 text-bullion" />
            <span>وضعیت اتصال:</span>
          </span>
          <div className="flex items-center gap-1.5 text-gain-text shrink-0">
            <span className="w-2 h-2 rounded-full bg-gain animate-pulse"></span>
            <span>آزاد فردوسی (12ms)</span>
          </div>
          <div className="flex items-center gap-1.5 text-bullion-light shrink-0">
            <span className="w-2 h-2 rounded-full bg-bullion animate-pulse"></span>
            <span>سامانه سنا (24ms)</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant shrink-0">
            <span className="w-2 h-2 rounded-full bg-surface-bright"></span>
            <span>سامانه نیما (18ms)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-on-surface-variant font-mono">TGJU Real-Time Stream</span>
        </div>
      </section>

      {/* 4 Hero Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            title: 'دلار آزاد فردوسی (USD)',
            priceToman: dollarItem ? dollarItem.priceToman : 263900,
            pct: dollarItem ? dollarItem.changePercent : 2.4,
            sub: 'کف: ۲۵۹,۹۰۰ • سقف: ۲۶۴,۳۱۰',
            border: 'border-bullion/40',
          },
          {
            title: 'یورو توافقی (EUR)',
            priceToman: euroItem ? euroItem.priceToman : 294330,
            pct: euroItem ? euroItem.changePercent : 1.99,
            sub: 'برابری جهانی EUR/USD: ۱.۱۱۴',
            border: 'border-white/[0.08]',
          },
          {
            title: 'طلای ۱۸ عیار خام (هر گرم)',
            priceToman: gold18Item ? gold18Item.priceToman : 26038800,
            pct: gold18Item ? gold18Item.changePercent : 1.16,
            sub: 'مظنه مثقال: ۱۱۲,۷۹۷,۰۰۰ تومان',
            border: 'border-bullion/40',
          },
          {
            title: 'سکه تمام طرح امامی',
            priceToman: coinEmamiItem ? coinEmamiItem.priceToman : 267090000,
            pct: coinEmamiItem ? coinEmamiItem.changePercent : 3.6,
            sub: 'حباب اسمی: ۳۰,۱۹۰,۰۰۰ تومان (۱۱.۳٪)',
            border: 'border-white/[0.08]',
          },
        ].map((c) => {
          const { text: pctText, isPositive, isNeutral } = formatPercent(c.pct);
          return (
            <div
              key={c.title}
              className={`glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 border ${c.border} shadow-lg flex flex-col justify-between gap-3 relative overflow-hidden group transition-all`}
            >
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant text-xs font-medium">{c.title}</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold tabular-nums ${
                    isNeutral
                      ? 'bg-white/[0.05] text-on-surface-variant'
                      : isPositive
                      ? 'bg-gain-surface text-gain-text border border-gain-border'
                      : 'bg-loss-surface text-loss-text border border-loss-border'
                  }`}
                >
                  {pctText}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono gold-gradient-text tabular-nums">
                  {formatPrice(c.priceToman, unit, false)}
                </span>
                <span className="text-on-surface-variant text-xs font-sans">
                  {unit === 'toman' ? 'تومان' : 'ریال'}
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant/70 font-mono">{c.sub}</span>
            </div>
          );
        })}
      </section>

      {/* 70/30 Trading Room Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* 70% Right: Interactive Chart & Watchlist Table (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Interactive Chart Container */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-base font-extrabold text-on-surface flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-bullion-light" />
                  <span>دیده‌بان نمودار تحلیلی برابری ارز و طلا</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  مقایسه تعاملی نوسانات زنده دلار آمریکا و طلای ۱۸ عیار در بازار ایران
                </p>
              </div>

              {/* Controls: Timeframes & Chart Type */}
              <div className="flex items-center gap-2">
                {/* Timeframes */}
                <div className="flex items-center p-1 bg-obsidian-950 rounded-xl border border-white/[0.08] text-xs font-mono">
                  {(['1H', '1D', '1W', '1M', '1Y'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        timeframe === tf
                          ? 'gold-gradient-btn'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                {/* Line / Candle Toggle */}
                <div className="flex items-center p-1 bg-obsidian-950 rounded-xl border border-white/[0.08]">
                  <button
                    onClick={() => setChartType('line')}
                    className={`p-1.5 rounded-lg transition-all ${
                      chartType === 'line'
                        ? 'gold-gradient-btn'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="نمودار خطی"
                  >
                    <LineChartIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setChartType('candle')}
                    className={`p-1.5 rounded-lg transition-all ${
                      chartType === 'candle'
                        ? 'gold-gradient-btn'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="نمودار کندل‌استیک"
                  >
                    <CandlestickChart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* SVG Interactive Candlestick / Line Chart Area */}
            <div className="w-full h-60 sm:h-72 relative flex items-center justify-center p-2 select-none">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 240">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="40" x2="700" y2="40" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                <line x1="0" y1="90" x2="700" y2="90" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                <line x1="0" y1="140" x2="700" y2="140" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                <line x1="0" y1="190" x2="700" y2="190" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />

                {chartType === 'line' ? (
                  <>
                    <path
                      d="M 0,180 C 80,175 140,160 200,140 C 280,120 340,145 420,110 C 500,80 580,70 700,35 L 700,240 L 0,240 Z"
                      fill="url(#areaGrad)"
                    />
                    <path
                      d="M 0,180 C 80,175 140,160 200,140 C 280,120 340,145 420,110 C 500,80 580,70 700,35"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 0,200 C 80,195 140,170 200,155 C 280,135 340,150 420,125 C 500,95 580,85 700,55"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.2"
                      strokeDasharray="6 4"
                      strokeLinecap="round"
                    />
                  </>
                ) : (
                  <>
                    {[
                      { x: 40, open: 180, close: 170, high: 160, low: 185 },
                      { x: 90, open: 170, close: 165, high: 155, low: 175 },
                      { x: 140, open: 165, close: 150, high: 145, low: 170 },
                      { x: 190, open: 150, close: 140, high: 135, low: 155 },
                      { x: 240, open: 140, close: 145, high: 130, low: 150 },
                      { x: 290, open: 145, close: 135, high: 125, low: 150 },
                      { x: 340, open: 135, close: 120, high: 110, low: 140 },
                      { x: 390, open: 120, close: 125, high: 115, low: 130 },
                      { x: 440, open: 125, close: 110, high: 100, low: 130 },
                      { x: 490, open: 110, close: 95, high: 85, low: 115 },
                      { x: 540, open: 95, close: 80, high: 75, low: 100 },
                      { x: 590, open: 80, close: 60, high: 50, low: 85 },
                      { x: 640, open: 60, close: 40, high: 30, low: 65 },
                    ].map((c, i) => {
                      const isUp = c.close < c.open;
                      const color = isUp ? '#10b981' : '#f43f5e';
                      return (
                        <g key={i}>
                          <line x1={c.x} y1={c.high} x2={c.x} y2={c.low} stroke={color} strokeWidth="1.5" />
                          <rect
                            x={c.x - 7}
                            y={Math.min(c.open, c.close)}
                            width="14"
                            height={Math.max(4, Math.abs(c.open - c.close))}
                            fill={color}
                            rx="2"
                          />
                        </g>
                      );
                    })}
                  </>
                )}
              </svg>
            </div>

            {/* Time labels & legend */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-bullion-light font-bold">
                  <span className="w-3 h-1 bg-bullion rounded"></span>
                  <span>طلای ۱۸ عیار</span>
                </span>
                <span className="flex items-center gap-1.5 text-gain-text font-bold">
                  <span className="w-3 h-1 bg-gain rounded border-dashed"></span>
                  <span>دلار آزاد تهران</span>
                </span>
              </div>
              <div className="flex items-center gap-6 font-mono text-[11px] text-on-surface-variant">
                <span>۰۹:۰۰</span>
                <span>۱۲:۰۰</span>
                <span>۱۵:۰۰</span>
                <span>۱۸:۰۰</span>
                <span className="text-bullion font-bold">زنده (TGJU)</span>
              </div>
            </div>
          </div>

          {/* Watchlist Order Book Table */}
          <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-sm font-bold text-on-surface">دیده‌بان نرخ ارزهای پرتقاضا</h3>
              <span className="text-xs text-on-surface-variant font-mono">Real-time Order Book</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-obsidian-950/70 text-on-surface-variant border-b border-white/[0.06] font-bold">
                    <th className="py-3 px-4">نماد و بازار</th>
                    <th className="py-3 px-4 text-center">خرید</th>
                    <th className="py-3 px-4 text-center">فروش</th>
                    <th className="py-3 px-4 text-center">تغییر</th>
                    <th className="py-3 px-4 text-center">زمان ثبت</th>
                    <th className="py-3 px-4 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {watchlistItems.map((item) => {
                    const { text: pctText, isPositive, isNeutral } = formatPercent(item.changePercent);
                    return (
                      <tr key={item.symbol} className="hover:bg-obsidian-surface/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-on-surface">{item.title}</td>
                        <td className="py-3.5 px-4 text-center font-mono text-on-surface-variant tabular-nums">
                          {formatPrice(Math.round(item.priceToman * 0.995), unit, false)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-black gold-gradient-text tabular-nums">
                          {formatPrice(item.priceToman, unit, false)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono tabular-nums">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isNeutral
                                ? 'bg-white/[0.05] text-on-surface-variant'
                                : isPositive
                                ? 'bg-gain-surface text-gain-text border border-gain-border'
                                : 'bg-loss-surface text-loss-text border border-loss-border'
                            }`}
                          >
                            {pctText}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-on-surface-variant text-[11px]">
                          {item.updatedAt}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => onSelectConverter(item.symbol)}
                            className="px-2.5 py-1 rounded-xl bg-obsidian-surface hover:bg-bullion hover:text-obsidian text-[11px] font-bold transition-all border border-white/[0.06] active:scale-95"
                          >
                            تبدیل
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 30% Left: Tools, Quick Converter & Fear/Greed Gauge (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
          {/* Fear & Greed Index Gauge */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col items-center gap-4 text-center">
            <div className="w-full flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-bullion" />
                <h3 className="text-sm font-bold text-on-surface">شاخص احساسات و طمع بازار</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gain-surface text-gain-text font-bold border border-gain-border">
                GREED 72
              </span>
            </div>

            {/* Semicircular Gauge SVG */}
            <div className="relative w-48 h-28 flex items-end justify-center overflow-hidden">
              <svg className="w-48 h-48" viewBox="0 0 200 200">
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#111c38"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#gaugeGrad)"
                  strokeWidth="16"
                  strokeDasharray="251.2"
                  strokeDashoffset="68"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="50%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute bottom-1 flex flex-col items-center">
                <span className="text-3xl font-black font-mono text-gain-text tabular-nums">۷۲</span>
                <span className="text-xs font-bold text-gain-text">طمع بازار (تقاضای بالا)</span>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant/80 leading-relaxed text-right">
              حاکمیت تقاضای پایدار در بازار طلای خام و شمش بورس کالا نشان‌دهنده ورود نقدینگی فعال و کاهش تمایل به نگهداری ریال است.
            </p>
          </div>

          {/* Quick Sidebar Converter */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-bullion" />
                <h3 className="text-sm font-bold text-on-surface">مبدل سریع فردوسی</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bullion/10 text-bullion-light border border-bullion/20 font-bold">
                INSTANT
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-on-surface-variant mb-1 font-medium">مقدار ورودی</label>
                <input
                  type="number"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-obsidian-card border border-white/[0.1] rounded-xl px-3 py-2.5 font-mono text-base font-bold tabular-nums focus:outline-none focus:border-bullion"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1 font-medium">واحد مبدأ</label>
                <select
                  value={quickSource}
                  onChange={(e) => setQuickSource(e.target.value)}
                  className="w-full bg-obsidian-card border border-white/[0.1] rounded-xl px-3 py-2.5 focus:outline-none focus:border-bullion text-xs font-bold"
                >
                  <option value="price_dollar_rl">دلار آمریکا (USD)</option>
                  <option value="price_eur">یورو اروپا (EUR)</option>
                  <option value="price_aed">درهم امارات (AED)</option>
                  <option value="price_try">لیر ترکیه (TRY)</option>
                  <option value="price_uah">گریونا اوکراین (UAH)</option>
                  <option value="geram18">طلای ۱۸ عیار (گرم)</option>
                </select>
              </div>

              {/* Converted Output Card */}
              <div className="p-3.5 rounded-xl bg-obsidian-card border border-white/[0.06] flex flex-col gap-1">
                <span className="text-on-surface-variant text-[11px]">مبلغ معادل:</span>
                <span className="text-lg font-black font-mono gold-gradient-text tabular-nums">
                  {formatPrice(quickResultToman, unit, true)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Intelligence News Feed */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="glass-panel rounded-2xl p-4 sm:p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-bullion/10 border border-bullion/20 flex items-center justify-center text-bullion shrink-0">
            <Newspaper className="w-6 h-6 text-bullion-light" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h4 className="text-sm font-bold text-on-surface">
              حرکت سرمایه‌ها به سمت شمش یک‌اونسی و گواهی سپرده بورس کالا
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              با افزایش تقاضای سرمایه‌گذاران حقوقی، حجم معاملات گواهی سپرده شمش طلا در بورس کالا رکورد جدیدی را به ثبت رساند و به تثبیت حباب سکه در بازار فیزیکی کمک شایانی کرد.
            </p>
            <span className="text-[10px] font-mono text-bullion-light mt-1">امروز ۱۴:۱۰ • بورس کالا</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gain-surface border border-gain-border flex items-center justify-center text-gain-text shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h4 className="text-sm font-bold text-on-surface">
              تخصیص ۱۲۵ میلیون یورو جهت تأمین کالاهای اساسی و تجهیزات صنعتی
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              بانک مرکزی اعلام کرد تمامی ثبت‌سفارش‌های مواد اولیه و صنایع دارویی با نرخ ترجیحی سامانه نیما تأمین گردیده و بازار حواله از پوشش کامل نقدینگی برخوردار است.
            </p>
            <span className="text-[10px] font-mono text-gain-text mt-1">امروز ۱۱:۴۵ • بانک مرکزی</span>
          </div>
        </div>
      </section>
    </div>
  );
};
