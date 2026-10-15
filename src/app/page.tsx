"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { CurrencyUnit, ViewTab, MarketDataResponse } from "@/types/market";
import { MarqueeTicker } from "@/components/shell/MarqueeTicker";
import { MasterHeader } from "@/components/shell/MasterHeader";
import { NavigationTabs } from "@/components/shell/NavigationTabs";
import { MasterFooter } from "@/components/shell/MasterFooter";
import { PriceAlertModal } from "@/components/shell/PriceAlertModal";
import { MobileNav } from "@/components/shell/MobileNav";
import { ForexView } from "@/components/views/ForexView";
import { GoldView } from "@/components/views/GoldView";
import { WatchlistView } from "@/components/views/WatchlistView";
import { ConverterView } from "@/components/views/ConverterView";
import { readAlerts, saveAlerts } from "@/lib/alerts";
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
  return (
    <div className="min-h-screen text-on-surface flex flex-col pb-20 md:pb-0">
      <header className="sticky top-0 z-40 shadow-2xl">
        <MarqueeTicker items={all} unit={unit} />
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-7">
        <div
          role="status"
          className={`flex flex-wrap justify-between items-center gap-2 text-xs px-4 py-3 rounded-xl mb-6 border ${error ? "text-loss-text bg-loss-surface border-loss-border" : "text-on-surface-variant bg-obsidian-card border-white/5"}`}
        >
          <span>
            {error ||
              `${status} • ${data ? new Date(data.timestamp).toLocaleString("fa-IR", { timeZone: "Asia/Tehran", hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" }) : "لطفاً چند لحظه صبر کنید"}`}
          </span>
          <a
            className="text-bullion hover:underline"
            href="https://t.me/az_be_ma_mabot"
            target="_blank"
            rel="noreferrer"
          >
            بات تلگرام زرپایش ↗
          </a>
        </div>
        {notice && (
          <div
            role="alert"
            className="glass-panel rounded-xl p-4 mb-5 flex justify-between gap-3 text-sm"
          >
            <span>{notice}</span>
            <button aria-label="بستن اعلان" onClick={() => setNotice("")}>
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
              <button className="text-bullion" onClick={fetchRates}>
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
