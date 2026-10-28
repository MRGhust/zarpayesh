"use client";

import React from "react";
import { ViewTab } from "@/types/market";
import { Banknote, Gem, LineChart, ArrowLeftRight } from "lucide-react";

interface NavigationTabsProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    {
      id: "forex" as ViewTab,
      label: "بازار ارز و اسکناس",
      icon: Banknote,
    },
    {
      id: "gold" as ViewTab,
      label: "طلا و مسکوکات",
      icon: Gem,
    },
    {
      id: "watchlist" as ViewTab,
      label: "دیده‌بان و نمودار تحلیلی",
      icon: LineChart,
    },
    {
      id: "converter" as ViewTab,
      label: "مبدل پیشرفته و سبد دارایی",
      icon: ArrowLeftRight,
    },
  ];

  return (
    <div className="w-full bg-surface-container-low/95 backdrop-blur-xl border-b border-white/[0.06] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center overflow-x-auto">
        <nav className="flex items-center gap-1 min-w-max" aria-label="تب‌های اصلی">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2 px-4 py-3.5 text-xs md:text-sm transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? "text-bullion-light font-bold border-bullion bg-bullion/10"
                    : "text-on-surface-variant hover:text-on-surface border-transparent hover:bg-white/[0.03]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-bullion" : "text-on-surface-variant"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
