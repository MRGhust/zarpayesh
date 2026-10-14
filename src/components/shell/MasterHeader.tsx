'use client';

import React, { useState, useEffect } from 'react';
import { CurrencyUnit } from '@/types/market';
import {
  Bell,
  Volume2,
  VolumeX,
  RefreshCw,
  Search,
  Clock,
  Coins,
  TrendingUp,
} from 'lucide-react';

interface MasterHeaderProps {
  unit: CurrencyUnit;
  onToggleUnit: (unit: CurrencyUnit) => void;
  onOpenAlertModal: () => void;
  onSync: () => void;
  isSyncing: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const MasterHeader: React.FC<MasterHeaderProps> = ({
  unit,
  onToggleUnit,
  onOpenAlertModal,
  onSync,
  isSyncing,
  searchQuery,
  onSearchChange,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format time in Tehran
      const timeStr = now.toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Tehran',
      });
      const dateStr = now.toLocaleDateString('fa-IR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'Asia/Tehran',
      });
      setCurrentTime(`تهران ${timeStr} | ${dateStr}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-16 w-full px-4 lg:px-6 flex items-center justify-between gap-4 border-b border-white/[0.06] bg-surface-container-lowest/95 backdrop-blur-xl">
      {/* Brand & Market Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(255,198,101,0.15)]">
            <Coins className="w-6 h-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-primary">زرپایش</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold border border-primary/20">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-on-surface-variant hidden sm:inline">
              پایش هوشمند بازار طلا، سکه و ارز TGJU
            </span>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="hidden xl:flex items-center gap-2 bg-surface-container-low px-3 py-1 rounded-full border border-secondary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
          </span>
          <span className="text-xs text-secondary font-medium">بازار باز است - به‌روزرسانی زنده</span>
        </div>

        {/* Tehran Clock */}
        <div className="hidden lg:flex items-center gap-1.5 text-on-surface-variant text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-outline" />
          <span>{currentTime || 'در حال دریافت زمان...'}</span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex items-center gap-2 flex-1 max-w-md mx-2">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="جستجوی نماد، ارز یا مسکوکات (دلار، امامی، طلا، لیر)..."
            className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 text-xs rounded-xl py-2 pr-9 pl-3 border border-white/[0.08] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Toman / Rial Global Switcher */}
        <div className="flex items-center p-0.5 bg-surface-container-low rounded-xl border border-white/[0.08]">
          <button
            onClick={() => onToggleUnit('toman')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              unit === 'toman'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            تومان
          </button>
          <button
            onClick={() => onToggleUnit('rial')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              unit === 'rial'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            ریال
          </button>
        </div>

        {/* Price Alert Button */}
        <button
          onClick={onOpenAlertModal}
          className="hidden sm:flex items-center gap-1.5 bg-primary-container hover:bg-primary text-on-primary-container px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-[0_0_12px_rgba(229,169,60,0.25)] active:scale-95"
          title="تنظیم هشدار قیمت جدید"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>هشدار قیمت</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-xl border transition-all ${
            soundEnabled
              ? 'text-on-surface bg-surface-container-high border-white/[0.12]'
              : 'text-on-surface-variant bg-surface-container-low border-white/[0.06]'
          }`}
          title={soundEnabled ? 'صدای نوسانات فعال' : 'بی‌صدا'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Sync / Refresh */}
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="p-2 text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container-high border border-white/[0.06] rounded-xl transition-all active:scale-95 disabled:opacity-50"
          title="تازه‌سازی زنده از TGJU"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container-high border border-white/[0.06] rounded-xl transition-all"
          title="اعلان‌ها"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        </button>
      </div>
    </div>
  );
};
