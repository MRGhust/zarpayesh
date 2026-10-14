'use client';

import React from 'react';
import { ViewTab } from '@/types/market';
import { Banknote, Gem, LineChart, ArrowLeftRight } from 'lucide-react';

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
      id: 'forex' as ViewTab,
      label: 'بازار ارز و اسکناس',
      icon: Banknote,
    },
    {
      id: 'gold' as ViewTab,
      label: 'طلا و مسکوکات',
      icon: Gem,
    },
    {
      id: 'watchlist' as ViewTab,
      label: 'دیده‌بان و نمودار تحلیلی',
      icon: LineChart,
    },
    {
      id: 'converter' as ViewTab,
      label: 'مبدل پیشرفته و سبد ارزی',
      icon: ArrowLeftRight,
    },
  ];

  return (
    <div className="w-full bg-surface-container-low px-4 lg:px-6 flex items-center overflow-x-auto border-b border-white/[0.06] select-none">
      <nav className="flex items-center gap-1 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm transition-all border-b-2 font-medium ${
                isActive
                  ? 'text-primary font-bold border-primary bg-surface-container/60 shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface border-transparent hover:bg-surface-container/30'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
