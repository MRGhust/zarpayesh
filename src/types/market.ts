export type CurrencyUnit = 'toman' | 'rial';
export type RateRegime = 'free' | 'sana' | 'nima';
export type ViewTab = 'forex' | 'gold' | 'watchlist' | 'converter';

export interface MarketItem {
  /** Only live observations may be broadcast by the Telegram bot. */
  dataQuality?: 'live' | 'estimated' | 'sample';
  observedAt?: string;
  id: string;
  symbol: string;
  title: string;
  titleEn: string;
  category: 'major' | 'middle-east' | 'cis-europe' | 'east-asia' | 'gold' | 'coin';
  priceRial: number;
  priceToman: number;
  buyPriceRial?: number;
  buyPriceToman?: number;
  sellPriceRial?: number;
  sellPriceToman?: number;
  changeRial: number;
  changePercent: number;
  lowRial: number;
  lowToman: number;
  highRial: number;
  highToman: number;
  updatedAt: string;
  sparkline?: number[];
  flagCode?: string;
  bubbleRial?: number;
  bubbleToman?: number;
  bubblePercent?: number;
  intrinsicValueRial?: number;
  intrinsicValueToman?: number;
  weightGrams?: number;
  karat?: number;
}

export interface MarketDataResponse {
  timestamp: string;
  source: 'tgju' | 'bonbast' | 'cache' | 'fallback';
  items: Record<string, MarketItem>;
  forexList: MarketItem[];
  goldList: MarketItem[];
  coinList: MarketItem[];
  macro: {
    dailyVolatilityPercent: number;
    estimatedVolumeUsd: string;
    sanaAverageToman: number;
    nimaAverageToman: number;
    nimaFreeSpreadPercent: number;
    nimaFreeSpreadToman: number;
    fearGreedScore: number;
    marketStatus: 'open' | 'closed';
  };
}
