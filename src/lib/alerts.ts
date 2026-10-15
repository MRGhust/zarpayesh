export interface BrowserAlert {
  id: string;
  symbol: string;
  threshold: number;
  direction: "above" | "below";
  triggered: boolean;
}
export const ALERTS_KEY = "zarpayesh.alerts.v1";
export function readAlerts(): BrowserAlert[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(ALERTS_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed
          .filter(
            (a): a is BrowserAlert =>
              a &&
              typeof a.id === "string" &&
              typeof a.symbol === "string" &&
              Number.isFinite(a.threshold) &&
              a.threshold > 0 &&
              ["above", "below"].includes(a.direction) &&
              typeof a.triggered === "boolean",
          )
          .slice(0, 30)
      : [];
  } catch {
    return [];
  }
}
export function saveAlerts(alerts: BrowserAlert[]) {
  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  window.dispatchEvent(new Event("zarpayesh-alerts"));
}
