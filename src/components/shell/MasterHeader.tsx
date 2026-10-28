"use client";

import React, { useState, useEffect } from "react";
import { CurrencyUnit } from "@/types/market";
import {
  Bell,
  Volume2,
  VolumeX,
  RefreshCw,
  Search,
  Coins,
  X,
} from "lucide-react";
import { PWAInstallButton } from "./PWAInstallPrompt";

interface MasterHeaderProps {
  unit: CurrencyUnit;
  onToggleUnit: (unit: CurrencyUnit) => void;
  onOpenAlertModal: () => void;
  onSync: () => void;
  isSyncing: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  dataStatus: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const MasterHeader: React.FC<MasterHeaderProps> = ({
  unit,
  onToggleUnit,
  onOpenAlertModal,
  onSync,
  isSyncing,
  soundEnabled,
  onToggleSound,
  dataStatus,
  searchQuery,
  onSearchChange,
}) => {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Tehran",
      });
      const dateStr = now.toLocaleDateString("fa-IR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "Asia/Tehran",
      });
      setCurrentTime(`${timeStr} · ${dateStr}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-full bg-obsidian-950/95 backdrop-blur-2xl border-b border-white/[0.08]">
      <div className="h-14 sm:h-16 max-w-7xl mx-auto px-2.5 sm:px-6 flex items-center justify-between gap-1.5 sm:gap-4 min-w-0">
        {/* Zone 1: Brand & Tehran Time */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-bullion/15 border border-bullion/30 flex items-center justify-center text-bullion shrink-0">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-bullion-light" />
            </div>
            <span className="text-base sm:text-xl font-black tracking-tight gold-gradient-text whitespace-nowrap shrink-0">
              زرپایش
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-on-surface-variant font-num whitespace-nowrap">
            <span>{dataStatus}</span>
            {currentTime && (
              <>
                <span aria-hidden="true">·</span>
                <span>{currentTime}</span>
              </>
            )}
          </div>
        </div>

        {/* Zone 2: Global Search Bar (Desktop) */}
        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md mx-2 min-w-0">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input
              aria-label="جستجوی دارایی"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="جستجوی نماد، ارز یا مسکوک (دلار، امامی، طلا، لیر)..."
              className="w-full bg-obsidian-card text-on-surface placeholder:text-on-surface-variant/50 text-xs rounded-xl py-2.5 pr-10 pl-8 border border-white/[0.08] focus:outline-none focus:border-transparent focus:ring-2 focus:ring-bullion transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="پاک کردن جستجو"
                onClick={() => onSearchChange("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Zone 3: Primary Actions & Toggles */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile Search Toggle */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label="جستجو"
            aria-expanded={mobileSearchOpen}
            className={`sm:hidden h-8 w-8 rounded-xl flex items-center justify-center border transition-colors shrink-0 ${
              mobileSearchOpen || searchQuery
                ? "text-bullion bg-bullion/10 border-bullion/30"
                : "text-on-surface-variant hover:text-on-surface bg-obsidian-card border-white/[0.08]"
            }`}
            title="جستجو"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Toman / Rial Segmented Unit Toggle */}
          <div
            className="flex items-center p-0.5 bg-obsidian-card rounded-xl border border-white/[0.08] shrink-0"
            role="group"
            aria-label="واحد پول"
          >
            <button
              type="button"
              onClick={() => onToggleUnit("toman")}
              aria-pressed={unit === "toman"}
              className={`h-7 sm:h-9 px-2 sm:px-3.5 text-[11px] sm:text-xs rounded-lg font-bold transition-all whitespace-nowrap shrink-0 ${
                unit === "toman"
                  ? "bg-bullion text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              تومان
            </button>
            <button
              type="button"
              onClick={() => onToggleUnit("rial")}
              aria-pressed={unit === "rial"}
              className={`h-7 sm:h-9 px-2 sm:px-3.5 text-[11px] sm:text-xs rounded-lg font-bold transition-all whitespace-nowrap shrink-0 ${
                unit === "rial"
                  ? "bg-bullion text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              ریال
            </button>
          </div>

          {/* In-App PWA Install Button */}
          <PWAInstallButton />

          {/* Price Alert Button */}
          <button
            type="button"
            onClick={() => onOpenAlertModal()}
            aria-label="ثبت هشدار قیمت"
            className="h-8 w-8 sm:h-10 sm:w-auto sm:px-3.5 rounded-xl gold-gradient-btn text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 whitespace-nowrap shrink-0"
            title="ثبت هشدار قیمت جدید"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden md:inline">هشدار قیمت</span>
          </button>

          {/* Audio Notification Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={
              soundEnabled
                ? "غیرفعال کردن صدای هشدار"
                : "فعال کردن صدای هشدار"
            }
            aria-pressed={soundEnabled}
            className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
              soundEnabled
                ? "text-bullion-light bg-bullion/10 border-bullion/30"
                : "text-on-surface-variant bg-obsidian-card border-white/[0.08]"
            }`}
            title={soundEnabled ? "اعلان صوتی فعال است" : "بی‌صدا"}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-bullion" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          {/* Live Sync Button */}
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            aria-label="تازه‌سازی زنده از TGJU"
            className="h-8 w-8 sm:h-10 sm:w-10 text-on-surface-variant hover:text-bullion bg-obsidian-card hover:bg-obsidian-surface border border-white/[0.08] rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 shrink-0"
            title="تازه‌سازی زنده از TGJU"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                isSyncing ? "animate-spin text-bullion" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Search Input Drawer (Collapsible, SSR-safe) */}
      {(mobileSearchOpen || Boolean(searchQuery)) && (
        <div className="sm:hidden px-2.5 pb-2.5 pt-1.5 border-t border-white/[0.06]">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input
              aria-label="جستجوی دارایی در موبایل"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="جستجوی نماد، ارز یا مسکوک (مثلاً دلار، سکه، طلا)..."
              className="w-full bg-obsidian-card text-on-surface placeholder:text-on-surface-variant/50 text-xs rounded-xl py-2.5 pr-10 pl-9 border border-bullion/40 focus:outline-none focus:ring-2 focus:ring-bullion transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="پاک کردن جستجو"
                onClick={() => onSearchChange("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
