'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CurrencyUnit, ViewTab, MarketDataResponse } from '@/types/market';
import { INITIAL_MARKET_DATA } from '@/data/mockFallback';
import { MarqueeTicker } from '@/components/shell/MarqueeTicker';
import { MasterHeader } from '@/components/shell/MasterHeader';
import { NavigationTabs } from '@/components/shell/NavigationTabs';
import { MasterFooter } from '@/components/shell/MasterFooter';
import { PriceAlertModal } from '@/components/shell/PriceAlertModal';
import { ForexView } from '@/components/views/ForexView';
import { GoldView } from '@/components/views/GoldView';
import { WatchlistView } from '@/components/views/WatchlistView';
import { ConverterView } from '@/components/views/ConverterView';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ViewTab>('forex');
  const [unit, setUnit] = useState<CurrencyUnit>('toman');
  const [marketData, setMarketData] = useState<MarketDataResponse>(INITIAL_MARKET_DATA);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [converterSymbol, setConverterSymbol] = useState<string>('price_dollar_rl');

  // Fetch live market data from /api/market
  const fetchRates = useCallback(async (showSyncIndicator = false) => {
    if (showSyncIndicator) setIsSyncing(true);
    try {
      const res = await fetch('/api/market', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.items) {
          setMarketData(data);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch from /api/market, retaining existing state:', err);
    } finally {
      if (showSyncIndicator) {
        setTimeout(() => setIsSyncing(false), 500);
      }
    }
  }, []);

  // Mount effect & 20s live polling
  useEffect(() => {
    fetchRates(true);
    const interval = setInterval(() => {
      fetchRates(false);
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  const handleSelectConverter = (symbol: string) => {
    setConverterSymbol(symbol);
    setActiveTab('converter');
  };

  const allItems = [
    ...(marketData.forexList || []),
    ...(marketData.goldList || []),
    ...(marketData.coinList || []),
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Fixed Header Stack */}
      <header className="sticky top-0 right-0 left-0 w-full z-40 flex flex-col shadow-2xl">
        <MarqueeTicker items={allItems} unit={unit} />
        <MasterHeader
          unit={unit}
          onToggleUnit={(newUnit) => setUnit(newUnit)}
          onOpenAlertModal={() => setIsAlertModalOpen(true)}
          onSync={() => fetchRates(true)}
          isSyncing={isSyncing}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </header>

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-6 py-6">
        {activeTab === 'forex' && (
          <ForexView
            items={marketData.forexList || []}
            unit={unit}
            onSelectConverter={handleSelectConverter}
            onOpenAlertModal={() => setIsAlertModalOpen(true)}
            macro={marketData.macro}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'gold' && (
          <GoldView
            goldItems={marketData.goldList || []}
            coinItems={marketData.coinList || []}
            unit={unit}
            onOpenAlertModal={() => setIsAlertModalOpen(true)}
            onSelectConverter={handleSelectConverter}
          />
        )}

        {activeTab === 'watchlist' && (
          <WatchlistView
            forexItems={marketData.forexList || []}
            goldItems={marketData.goldList || []}
            coinItems={marketData.coinList || []}
            unit={unit}
            onSelectConverter={handleSelectConverter}
            onOpenAlertModal={() => setIsAlertModalOpen(true)}
          />
        )}

        {activeTab === 'converter' && (
          <ConverterView
            forexItems={marketData.forexList || []}
            goldItems={marketData.goldList || []}
            coinItems={marketData.coinList || []}
            unit={unit}
            initialSymbol={converterSymbol}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <MasterFooter />

      {/* Price Alert Modal */}
      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        items={allItems}
        unit={unit}
      />
    </div>
  );
}
