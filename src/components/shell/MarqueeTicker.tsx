'use client';

import React from 'react';
import { MarketItem, CurrencyUnit } from '@/types/market';
import { formatPrice, formatPercent } from '@/lib/formatters';

interface MarqueeTickerProps {
  items: MarketItem[];
  unit: CurrencyUnit;
}

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({ items, unit }) => {
  // If items empty, use empty array
  const displayItems = items.length > 0 ? items : [];

  return (
    <div className="w-full h-8 bg-surface-container-lowest overflow-hidden flex items-center border-b border-white/[0.04] select-none">
      <div className="animate-marquee-rtl flex items-center gap-space-lg text-body-sm font-body-sm text-on-surface-variant whitespace-nowrap">
        {displayItems.concat(displayItems).map((item, idx) => {
          const { text: pctText, isPositive, isNeutral } = formatPercent(item.changePercent);
          const isOunce = item.symbol === 'ons';
          return (
            <div key={`${item.id}-${idx}`} className="flex items-center gap-space-xs shrink-0">
              <span className="text-primary font-mono text-xs font-semibold">{item.title}</span>
              <span className="font-mono text-xs text-on-surface font-medium">
                {formatPrice(item.priceToman, unit, false, isOunce)}
              </span>
              <span
                className={`px-1 py-0.5 rounded text-[10px] font-mono leading-none ${
                  isNeutral
                    ? 'text-on-surface-variant bg-surface-variant'
                    : isPositive
                    ? 'text-secondary bg-secondary/10'
                    : 'text-error bg-error/10'
                }`}
              >
                {pctText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
