const FAVORITES_KEY = "zarpayesh.favorites.v1";

export function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return ["price_dollar_rl", "geram18", "sekee", "price_eur"];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return ["price_dollar_rl", "geram18", "sekee", "price_eur"];
  }
}

export function toggleFavoriteSymbol(symbol: string): string[] {
  const current = readFavorites();
  const next = current.includes(symbol)
    ? current.filter((s) => s !== symbol)
    : [...current, symbol];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  } catch {}
  return next;
}
