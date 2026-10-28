"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { CurrencyUnit, ViewTab, MarketDataResponse } from "@/types/market";
import { MarqueeTicker } from "@/components/shell/MarqueeTicker";
import { MasterHeader } from "@/components/shell/MasterHeader";
import { NavigationTabs } from "@/components/shell/NavigationTabs";
import { MasterFooter } from "@/components/shell/MasterFooter";
import { PriceAlertModal } from "@/components/shell/PriceAlertModal";
import { MobileNav } from "@/components/shell/MobileNav";
import { OfflineIndicator } from "@/components/shell/PWAInstallPrompt";
import { ForexView } from "@/components/views/ForexView";
import { GoldView } from "@/components/views/GoldView";
import { WatchlistView } from "@/components/views/WatchlistView";
import { ConverterView } from "@/components/views/ConverterView";
import { readAlerts, saveAlerts } from "@/lib/alerts";
import { formatPrice, formatPercent } from "@/lib/formatters";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ViewTab>("forex"),
    [unit, setUnit] = useState<CurrencyUnit>("toman"),
    [data, setData] = useState<MarketDataResponse | null>(null);
  const [syncing, setSyncing] = useState(false),
    [error, setError] = useState(""),
    [modal, setModal] = useState(false),
    [search, setSearch] = useState(""),
    [converter, setConverter] = useState("price_dollar_rl"),
    [sound, setSound] = useState(false),
    [notice, setNotice] = useState("");
  const [alertSymbol, setAlertSymbol] = useState("price_dollar_rl");
  const openAlert = (symbol?: string) => {
    setAlertSymbol(symbol || "price_dollar_rl");
    setModal(true);
  };
  const request = useRef<AbortController | null>(null);
  const fetchRates = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setSyncing(true);
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch("/api/market", {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("API unavailable");
      const result = await response.json();
      if (!result?.items || !Array.isArray(result.forexList))
        throw new Error("Invalid market");
      if (request.current === controller) {
        setData(result);
        setError(
          result.source === "fallback"
            ? "منبع زنده در دسترس نیست؛ قیمت نمونه نمایش داده نمی‌شود."
            : "",
        );
      }
    } catch {
      if (request.current === controller)
        setError(
          "ارتباط با منبع برقرار نشد؛ آخرین نرخ‌های دریافت‌شده ممکن است قدیمی باشند.",
        );
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) setSyncing(false);
    }
  }, []);

  useEffect(() => {
    void fetchRates();
    const interval = setInterval(() => {
      if (!document.hidden) void fetchRates();
    }, 20000);
    const visible = () => {
      if (!document.hidden) void fetchRates();
    };
    document.addEventListener("visibilitychange", visible);
    try {
      setSound(localStorage.getItem("zarpayesh.sound") === "on");
      if (localStorage.getItem("zarpayesh.unit") === "rial") setUnit("rial");
    } catch {}
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", visible);
      request.current?.abort();
      request.current = null;
    };
  }, [fetchRates]);

  useEffect(() => {
    if (!data) return;
    const alerts = readAlerts();
    const triggered = alerts.filter((alert) => {
      const item = data.items[alert.symbol];
      if (
        alert.triggered ||
        item?.dataQuality !== "live" ||
        !item.observedAt ||
        Date.now() - Date.parse(item.observedAt) > 180000
      )
        return false;
      return alert.direction === "above"
        ? item.priceRial >= alert.threshold
        : item.priceRial <= alert.threshold;
    });
    if (!triggered.length) return;
    try {
      saveAlerts(
        alerts.map((a) =>
          triggered.some((t) => t.id === a.id) ? { ...a, triggered: true } : a,
        ),
      );
    } catch {
      return;
    }
    setNotice(
      `هشدار قیمت: ${triggered.map((a) => data.items[a.symbol].title).join("، ")} به آستانهٔ تعیین‌شده رسید.`,
    );
    if (sound) {
      const audio = new Audio("/sounds/alert.wav");
      void audio.play().catch(() => {});
    }
  }, [data, sound]);

  const visible = (items = Object.values(data?.items || {})) =>
    items.filter((item) => item.dataQuality === "live");
  const forex = visible(data?.forexList || []),
    gold = visible(data?.goldList || []),
    coins = visible(data?.coinList || []),
    all = [...forex, ...gold, ...coins];

  const selectConverter = (symbol: string) => {
    setConverter(symbol);
    setActiveTab("converter");
    setSearch("");
  };

  const toggleUnit = (value: CurrencyUnit) => {
    setUnit(value);
    try {
      localStorage.setItem("zarpayesh.unit", value);
    } catch {}
  };

  const status = error
    ? "ارتباط ناموفق"
    : data?.source === "cache"
      ? "آخرین دادهٔ ذخیره‌شده"
      : data
        ? "دادهٔ دریافتی TGJU"
        : "در حال دریافت";

  // 4 Key Market Benchmarks for Top Pulse Strip
  const benchmarks = [
    { item: data?.items["price_dollar_rl"], tab: "forex" as ViewTab },
    { item: data?.items["geram18"], tab: "gold" as ViewTab },
    { item: data?.items["sekee"], tab: "gold" as ViewTab },
    { item: data?.items["ons"], tab: "gold" as ViewTab },
  ].filter((b) => b.item?.dataQuality === "live");

  return (
    <div className="min-h-screen text-on-surface flex flex-col pb-safe md:pb-0">
      <header className="sticky top-0 z-40">
        <div className="hidden sm:block">
          <MarqueeTicker items={all} unit={unit} />
        </div>
        <MasterHeader
          unit={unit}
          onToggleUnit={toggleUnit}
          onOpenAlertModal={openAlert}
          onSync={fetchRates}
          isSyncing={syncing}
          searchQuery={search}
          onSearchChange={setSearch}
          soundEnabled={sound}
          dataStatus={status}
          onToggleSound={() => {
            const next = !sound;
            setSound(next);
            try {
              localStorage.setItem("zarpayesh.sound", next ? "on" : "off");
            } catch {}
            if (next) {
              const audio = new Audio("/sounds/alert.wav");
              void audio.play().catch(() => {});
            }
          }}
        />
        <div className="hidden md:block">
          <NavigationTabs
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setSearch("");
            }}
          />
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div
          role="status"
          className={`flex flex-wrap justify-between items-center gap-2 text-xs px-4 py-2.5 rounded-xl mb-5 border ${
            error
              ? "text-loss-text bg-loss-surface border-loss-border"
              : "text-on-surface-variant bg-obsidian-card/80 border-white/5"
          }`}
        >
          <span>
            {error ||
              `${status} • ${
                data
                  ? new Date(data.timestamp).toLocaleString("fa-IR", {
                      timeZone: "Asia/Tehran",
                      hour: "2-digit",
                      minute: "2-digit",
                      month: "short",
                      day: "numeric",
                    })
                  : "لطفاً چند لحظه صبر کنید"
              }`}
          </span>
          <a
            className="text-bullion font-semibold hover:underline"
            href="https://t.me/az_be_ma_mabot"
            target="_blank"
            rel="noreferrer"
          >
            بات تلگرام زرپایش ↗
          </a>
        </div>

        {/* Key Market Benchmarks Pulse Bar */}
        {benchmarks.length > 0 && !search.trim() && (
          <section
            aria-label="شاخص‌های کلیدی بازار"
            className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mb-6"
          >
            {benchmarks.map(({ item, tab }) => {
              if (!item) return null;
              const pct = formatPercent(item.changePercent);
              const isOunce = item.id === "ons";
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className="text-right bg-obsidian-card/85 hover:bg-obsidian-surface border border-white/[0.07] hover:border-bullion/35 rounded-2xl p-3 sm:p-4 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-on-surface truncate">
                      {item.title}
                    </span>
                    <span
                      dir="ltr"
                      className={`text-[11px] font-num font-bold shrink-0 ${
                        pct.isPositive
                          ? "text-gain-text"
                          : pct.isNeutral
                            ? "text-on-surface-variant"
                            : "text-loss-text"
                      }`}
                    >
                      {pct.text}
                    </span>
                  </div>
                  <p
                    className="font-num text-lg sm:text-xl font-black text-bullion-light mt-2"
                    dir="ltr"
                  >
                    {formatPrice(item.priceToman, unit, false, isOunce)}{" "}
                    <span className="text-[10px] font-normal text-on-surface-variant">
                      {isOunce ? "دلار" : unit === "rial" ? "ریال" : "تومان"}
                    </span>
                  </p>
                </button>
              );
            })}
          </section>
        )}

        {notice && (
          <div
            role="alert"
            className="glass-panel rounded-xl p-4 mb-5 flex justify-between items-center gap-3 text-sm border border-bullion/40"
          >
            <span>{notice}</span>
            <button
              type="button"
              aria-label="بستن اعلان"
              onClick={() => setNotice("")}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-white/10"
            >
              ×
            </button>
          </div>
        )}

        {!data ? (
          <div
            className="glass-panel p-16 rounded-2xl text-center text-on-surface-variant"
            role="status"
          >
            {syncing ? (
              "در حال دریافت نرخ‌های بازار…"
            ) : (
              <button
                type="button"
                className="text-bullion font-bold px-4 py-2 rounded-xl bg-bullion/10 border border-bullion/30"
                onClick={fetchRates}
              >
                تلاش دوباره برای دریافت قیمت
              </button>
            )}
          </div>
        ) : search.trim() ? (
          <ForexView
            items={all}
            unit={unit}
            onSelectConverter={selectConverter}
            onOpenAlertModal={openAlert}
            searchQuery={search}
          />
        ) : (
          <>
            {activeTab === "forex" && (
              <ForexView
                items={forex}
                unit={unit}
                onSelectConverter={selectConverter}
                onOpenAlertModal={openAlert}
                searchQuery=""
              />
            )}
            {activeTab === "gold" && (
              <GoldView
                goldItems={gold}
                coinItems={coins}
                unit={unit}
                onOpenAlertModal={openAlert}
                onSelectConverter={selectConverter}
              />
            )}
            {activeTab === "watchlist" && (
              <WatchlistView
                forexItems={forex}
                goldItems={gold}
                coinItems={coins}
                unit={unit}
                onSelectConverter={selectConverter}
                onOpenAlertModal={openAlert}
              />
            )}
            {activeTab === "converter" && (
              <ConverterView
                forexItems={forex}
                goldItems={gold}
                coinItems={coins}
                unit={unit}
                initialSymbol={converter}
              />
            )}
          </>
        )}
      </main>

      <MasterFooter />
      <OfflineIndicator />
      <MobileNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSearch("");
        }}
      />
      <PriceAlertModal
        initialSymbol={alertSymbol}
        isOpen={modal}
        onClose={() => setModal(false)}
        items={all.filter((item) => item.dataQuality === "live")}
        unit={unit}
      />
    </div>
  );
}
