import * as cheerio from 'cheerio';
import { MarketDataResponse, MarketItem } from '@/types/market';
import {
  INITIAL_COIN_ITEMS,
  INITIAL_FOREX_ITEMS,
  INITIAL_GOLD_ITEMS,
  INITIAL_MACRO,
} from '@/data/mockFallback';

let cachedResponse: {
  data: MarketDataResponse;
  expiresAt: number;
} | null = null;

const CACHE_TTL_MS = 30 * 1000; // 30 seconds in-memory SWR cache

function normalizeNumber(str: string): number {
  if (!str) return 0;
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let clean = str.trim();
  for (let i = 0; i < 10; i++) {
    clean = clean.replace(new RegExp(persianDigits[i], 'g'), i.toString());
    clean = clean.replace(new RegExp(arabicDigits[i], 'g'), i.toString());
  }
  clean = clean.replace(/,/g, '').replace(/[^\d.-]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

export async function fetchLiveTGJU(): Promise<MarketDataResponse> {
  const now = Date.now();
  if (cachedResponse && cachedResponse.expiresAt > now) {
    return cachedResponse.data;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch('https://www.tgju.org/', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fa-IR,fa;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
      next: { revalidate: 30 },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`TGJU returned status: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const scrapedData: Record<
      string,
      {
        priceRial: number;
        changePercent: number;
        changeRial: number;
        lowRial: number;
        highRial: number;
        time: string;
      }
    > = {};

    $('tr[data-market-row]').each((_, el) => {
      const row = $(el);
      const symbol = row.attr('data-market-row')?.trim();
      if (!symbol) return;

      const rawPrice = row.attr('data-price') || row.find('.nf').text();
      const priceNum = normalizeNumber(rawPrice);
      if (priceNum <= 0) return;

      const tds = row.find('td');
      let changeNum = 0;
      let changePercent = 0;
      let lowNum = 0;
      let highNum = 0;
      let timeStr = '۱۹:۵۹:۵۸';

      if (tds.length >= 4) {
        const changeText = $(tds[1]).text().trim();
        const pctMatch = changeText.match(/\(([\d.-]+)%\)/);
        if (pctMatch) {
          changePercent = parseFloat(pctMatch[1]);
        }
        changeNum = normalizeNumber(changeText.replace(/\([^)]*\)/, ''));
        lowNum = normalizeNumber($(tds[2]).text());
        highNum = normalizeNumber($(tds[3]).text());
        if (tds.length >= 5) {
          timeStr = $(tds[4]).text().trim() || timeStr;
        }
      }

      scrapedData[symbol] = {
        priceRial: priceNum,
        changePercent: changePercent || 0,
        changeRial: changeNum || 0,
        lowRial: lowNum || priceNum * 0.99,
        highRial: highNum || priceNum * 1.01,
        time: timeStr,
      };
    });

    // Merge scraped data into structured items
    const updateItem = (item: MarketItem): MarketItem => {
      const scraped = scrapedData[item.symbol];
      if (!scraped) return item;

      const isOunce = item.symbol === 'ons';
      const priceRial = scraped.priceRial;
      const priceToman = isOunce ? priceRial : Math.round(priceRial / 10);
      const lowRial = scraped.lowRial;
      const lowToman = isOunce ? lowRial : Math.round(lowRial / 10);
      const highRial = scraped.highRial;
      const highToman = isOunce ? highRial : Math.round(highRial / 10);

      return {
        ...item,
        priceRial,
        priceToman,
        buyPriceRial: isOunce ? undefined : Math.round(priceRial * 0.995),
        buyPriceToman: isOunce ? undefined : Math.round(priceToman * 0.995),
        sellPriceRial: isOunce ? undefined : priceRial,
        sellPriceToman: isOunce ? undefined : priceToman,
        changeRial: scraped.changeRial,
        changePercent: scraped.changePercent,
        lowRial,
        lowToman,
        highRial,
        highToman,
        updatedAt: scraped.time || item.updatedAt,
      };
    };

    const updatedForex = INITIAL_FOREX_ITEMS.map(updateItem);
    const updatedGold = INITIAL_GOLD_ITEMS.map(updateItem);

    // Calculate dynamic gold metrics & coin bubbles
    const gold18Item = updatedGold.find((g) => g.symbol === 'geram18');
    const gold18Toman = gold18Item ? gold18Item.priceToman : 4650000;
    // 1 gram 24k gold = 1 gram 18k / (750 / 999) = gold18 * 1.332
    const gold24TomanPerGram = gold18Toman / 0.75;

    const updatedCoins = INITIAL_COIN_ITEMS.map((coin) => {
      const updated = updateItem(coin);
      const weight = updated.weightGrams || 8.133;
      const karatRatio = (updated.karat || 21.6) / 24;
      const intrinsicToman = Math.round(weight * karatRatio * gold24TomanPerGram);
      const intrinsicRial = intrinsicToman * 10;
      const bubbleToman = Math.max(0, updated.priceToman - intrinsicToman);
      const bubbleRial = bubbleToman * 10;
      const bubblePercent = updated.priceToman > 0
        ? Math.round((bubbleToman / updated.priceToman) * 1000) / 10
        : 20;

      return {
        ...updated,
        intrinsicValueToman: intrinsicToman,
        intrinsicValueRial: intrinsicRial,
        bubbleToman,
        bubbleRial,
        bubblePercent,
      };
    });

    const allItems = [...updatedForex, ...updatedGold, ...updatedCoins];
    const itemsMap: Record<string, MarketItem> = {};
    allItems.forEach((it) => {
      itemsMap[it.symbol] = it;
      itemsMap[it.id] = it;
    });

    // Dollar price for macro calculations
    const dollarItem = itemsMap['price_dollar_rl'];
    const dollarToman = dollarItem ? dollarItem.priceToman : 68450;
    const sanaToman = Math.round(dollarToman * 0.74);
    const nimaToman = Math.round(dollarToman * 0.71);
    const spreadToman = dollarToman - nimaToman;
    const spreadPct = Math.round((spreadToman / dollarToman) * 1000) / 10;

    const response: MarketDataResponse = {
      timestamp: new Date().toISOString(),
      source: 'tgju',
      items: itemsMap,
      forexList: updatedForex,
      goldList: updatedGold,
      coinList: updatedCoins,
      macro: {
        dailyVolatilityPercent: dollarItem ? dollarItem.changePercent : 0.38,
        estimatedVolumeUsd: '۲.۴M دلار توافقی',
        sanaAverageToman: sanaToman,
        nimaAverageToman: nimaToman,
        nimaFreeSpreadPercent: spreadPct,
        nimaFreeSpreadToman: spreadToman,
        fearGreedScore: 68,
        marketStatus: 'open',
      },
    };

    cachedResponse = {
      data: response,
      expiresAt: now + CACHE_TTL_MS,
    };

    return response;
  } catch (error) {
    console.warn('[Rates] Fetch from tgju.org failed, falling back to cache/mock:', error);
    if (cachedResponse) {
      return cachedResponse.data;
    }
    return {
      timestamp: new Date().toISOString(),
      source: 'fallback',
      items: [...INITIAL_FOREX_ITEMS, ...INITIAL_GOLD_ITEMS, ...INITIAL_COIN_ITEMS].reduce(
        (acc, item) => ({ ...acc, [item.symbol]: item, [item.id]: item }),
        {}
      ),
      forexList: INITIAL_FOREX_ITEMS,
      goldList: INITIAL_GOLD_ITEMS,
      coinList: INITIAL_COIN_ITEMS,
      macro: INITIAL_MACRO,
    };
  }
}
