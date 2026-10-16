"use client";

import React, { useState, useEffect } from "react";
import { CurrencyUnit } from "@/types/market";
import {
  Bell,
  Volume2,
  VolumeX,
  RefreshCw,
  Search,
  Clock,
  Coins,
  TrendingUp,
} from "lucide-react";

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
      setCurrentTime(`${timeStr} • ${dateStr}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-obsidian-950/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      <div className="h-16 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Market Status */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-bullion-400/20 via-bullion/10 to-transparent border border-bullion/30 flex items-center justify-center text-bullion shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-bullion-light" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-2xl font-black tracking-tight gold-gradient-text">
                  زرپایش
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-bullion/15 text-bullion-light font-bold border border-bullion/30">
                  TGJU
                </span>
              </div>
              <span className="text-[10px] text-on-surface-variant hidden md:inline">
                ترمینال بلادرنگ طلا، سکه و ارز TGJU
              </span>
            </div>
          </div>

          {/* Live Status Indicator (Desktop) */}
          <div className="hidden xl:flex items-center gap-2 bg-obsidian-card px-3 py-1 rounded-full border border-gain-border">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gain opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gain"></span>
            </span>
            <span className="text-xs text-gain-text font-medium">
              {dataStatus}
            </span>
          </div>

          {/* Clock (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 text-on-surface-variant text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-outline" />
            <span>{currentTime || "در حال دریافت..."}</span>
          </div>
        </div>

        {/* Global Search Bar (Desktop) */}
        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input
              aria-label="جستجوی دارایی"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="جستجوی نماد، ارز یا مسکوک (دلار، امامی، طلا، لیر)..."
              className="w-full bg-obsidian-card text-on-surface placeholder:text-on-surface-variant/50 text-xs rounded-xl py-2 pr-10 pl-3 border border-white/[0.08] focus:outline-none focus:border-transparent focus:ring-2 focus:ring-bullion transition-all"
            />
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="sm:hidden p-2 rounded-xl text-on-surface-variant hover:text-on-surface bg-obsidian-card border border-white/[0.08]"
            title="جستجو"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Toman / Rial Unit Toggle */}
          <div className="flex items-center p-0.5 bg-obsidian-card rounded-xl border border-white/[0.08] shadow-inner">
            <button
              onClick={() => onToggleUnit("toman")}
              className={`px-3 sm:px-4 py-2 text-xs rounded-lg font-bold transition-all ${
                unit === "toman"
                  ? "bg-bullion text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              تومان
            </button>
            <button
              onClick={() => onToggleUnit("rial")}
              className={`px-3 sm:px-4 py-2 text-xs rounded-lg font-bold transition-all ${
                unit === "rial"
                  ? "bg-bullion text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              ریال
            </button>
          </div>

          {/* Price Alert Button */}
          <button
            onClick={onOpenAlertModal}
            className="hidden md:flex items-center gap-1.5 gold-gradient-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
            title="ثبت هشدار قیمت جدید"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>هشدار قیمت</span>
          </button>

          {/* Audio Notification Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled
                ? "text-bullion-light bg-bullion/10 border-bullion/30"
                : "text-on-surface-variant bg-obsidian-card border-white/[0.08]"
            }`}
            title={soundEnabled ? "اعلان صوتی فعال است" : "بی‌صدا"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-bullion" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Live Sync Button */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="p-2 text-on-surface-variant hover:text-bullion bg-obsidian-card hover:bg-obsidian-surface border border-white/[0.08] rounded-xl transition-all active:scale-95 disabled:opacity-50"
            title="تازه‌سازی زنده از TGJU"
          >
            <RefreshCw
              className={`w-4 h-4 ${isSyncing ? "animate-spin text-bullion" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Search Input Drawer (Collapsible) */}
      {mobileSearchOpen && (
        <div className="sm:hidden px-3 pb-3 pt-1 border-t border-white/[0.06] animate-in slide-in-from-top-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input
              aria-label="جستجوی دارایی"
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="جستجوی نماد، ارز یا مسکوک..."
              className="w-full bg-obsidian-card text-on-surface placeholder:text-on-surface-variant/50 text-xs rounded-xl py-2.5 pr-10 pl-3 border border-bullion/40 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-bullion transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
};
