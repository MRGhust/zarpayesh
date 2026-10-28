"use client";

import React from "react";
import { ViewTab } from "@/types/market";
import { Banknote, Gem, LineChart, ArrowLeftRight } from "lucide-react";

interface MobileNavProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    {
      id: "forex" as ViewTab,
      label: "ارزها",
      icon: Banknote,
    },
    {
      id: "gold" as ViewTab,
      label: "طلا و سکه",
      icon: Gem,
    },
    {
      id: "watchlist" as ViewTab,
      label: "دیده‌بان",
      icon: LineChart,
    },
    {
      id: "converter" as ViewTab,
      label: "مبدل ارز",
      icon: ArrowLeftRight,
    },
  ];

  return (
    <nav
      aria-label="ناوبری موبایل"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-obsidian-950/95 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-1 pb-[max(0.35rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-4 gap-1 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={`min-h-[48px] flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-95 whitespace-nowrap ${
                isActive
                  ? "bg-bullion/15 border border-bullion/35 text-bullion-light font-bold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-bullion-light" : "text-on-surface-variant"
                }`}
              />
              <span
                className={`text-[11px] mt-1 leading-none ${
                  isActive ? "text-bullion font-bold" : "text-on-surface-variant"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
