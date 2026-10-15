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
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-obsidian-card/95 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-8px_30px_rgba(0,0,0,0.6)] px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-4 gap-1 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all active:scale-95 ${
                isActive
                  ? "bg-bullion/15 text-bullion-light font-bold shadow-[inset_0_1px_0_0_rgba(245,158,11,0.2)]"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-white/[0.04]"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-bullion-light" : "text-on-surface-variant"}`}
                />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-bullion animate-pulse" />
                )}
              </div>
              <span
                className={`text-[11px] mt-1 ${isActive ? "text-bullion-light font-bold" : "text-on-surface-variant"}`}
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
