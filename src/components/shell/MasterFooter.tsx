'use client';

import React from 'react';
import { ShieldCheck, Database, Radio, Code2, Heart } from 'lucide-react';

export const MasterFooter: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-white/[0.06] text-on-surface-variant text-xs mt-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/[0.06]">
          {/* Col 1 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary font-bold text-base">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>سامانه مانیتورینگ زرپایش (ZarPayesh)</span>
            </div>
            <p className="leading-relaxed text-[13px] text-on-surface-variant/80">
              سکوی اجرایی و تخصصی مانیتورینگ بلادرنگ مظنه طلا، مسکوکات، دلار و ارزهای بین‌المللی با تمرکز بر شفافیت داده، دقت الگوریتمی، و پشتیبانی بومی از بازار مالی ایران.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-secondary mt-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>پروتکل زنده همگام با دیتاسنترهای تهران و استانبول</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-3">
            <h4 className="text-on-surface font-semibold text-sm flex items-center gap-1.5">
              <Database className="w-4 h-4 text-primary" />
              <span>مراجع تجمیع نرخ‌ها</span>
            </h4>
            <ul className="space-y-2 text-[12px]">
              <li>شبکه اطلاع‌رسانی طلا، فلزات و ارز (TGJU.org)</li>
              <li>میانگین موزون سنا (اسکناس صرافی ملی)</li>
              <li>سامانه معاملات حواله نیما (بانک مرکزی)</li>
              <li>اتحادیه طلا و جواهر تهران</li>
              <li>پلتفرم برابری نرخ آزاد فردوسی و دبی</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-3">
            <h4 className="text-on-surface font-semibold text-sm flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-primary" />
              <span>امکانات و ابزارهای تحلیلی</span>
            </h4>
            <ul className="space-y-2 text-[12px]">
              <li>مبدل فوق‌پیشرفته چند ارزی و سبد تبدیل</li>
              <li>محاسبه‌گر فرمول رسمی فاکتور طلا و اجرت</li>
              <li>ماتریس جامع حباب ذاتی مسکوکات قانونی</li>
              <li>تحلیل اسپرد و شکاف آربیتراژ نیما / آزاد</li>
              <li>نمودارهای تعاملی تکنیکال و فید زنده اخبار</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="flex flex-col gap-3">
            <h4 className="text-on-surface font-semibold text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span>سلب مسئولیت و شفافیت حقوقی</span>
            </h4>
            <p className="leading-relaxed text-[12px] text-on-surface-variant/70">
              زرپایش صرفاً یک موتور پردازش و بصری‌سازی داده‌های عمومی مالی است و هیچ‌گونه خدمات صرافی، مبادله ریال، خرید یا فروش فیزیکی طلا و ارز ارائه نمی‌دهد. نرخ‌ها صرفاً جنبه اطلاع‌رسانی و تحلیلی دارند.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-on-surface-variant/60 font-mono">
          <div className="flex items-center gap-2">
            <span>ZarPayesh Financial Terminal v3.4</span>
            <span>•</span>
            <span>Engine Latency: 18ms</span>
            <span>•</span>
            <span className="text-secondary">All Systems Operational</span>
          </div>
          <div className="flex items-center gap-1">
            <span>توسعه یافته با استانداردهای مدرن فرانت‌اند و API بلادرنگ</span>
            <Heart className="w-3.5 h-3.5 text-error inline mx-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};
