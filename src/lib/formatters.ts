import { CurrencyUnit } from "@/types/market";

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(
  input: number | string | undefined | null,
): string {
  if (input === undefined || input === null) return "۰";
  const str = input.toString();
  return str.replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)] || d);
}

export function formatNumberWithCommas(num: number): string {
  if (!Number.isFinite(num)) return "—";
  const parts = num.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  return parts.join("٫");
}

export function formatPrice(
  amount: number,
  unit: CurrencyUnit = "toman",
  includeUnit = false,
  isOunce = false,
): string {
  if (isOunce) {
    const formatted = formatNumberWithCommas(Math.round(amount * 100) / 100);
    return includeUnit
      ? `${toPersianDigits(formatted)} دلار`
      : toPersianDigits(formatted);
  }
  const displayVal =
    unit === "toman" ? Math.round(amount) : Math.round(amount * 10);
  const formatted = formatNumberWithCommas(displayVal);
  const persianStr = toPersianDigits(formatted);
  return includeUnit
    ? `${persianStr} ${unit === "toman" ? "تومان" : "ریال"}`
    : persianStr;
}

export function formatPercent(percent: number): {
  text: string;
  isPositive: boolean;
  isNeutral: boolean;
} {
  const isNeutral = Math.abs(percent) < 0.001;
  const isPositive = percent > 0;
  const absVal = Math.abs(percent).toFixed(2);
  const sign = isPositive ? "+" : isNeutral ? "" : "-";
  const text = `${sign}${toPersianDigits(absVal)}٪`;
  return { text, isPositive, isNeutral };
}

export function parseLocalizedNumber(input: string): number {
  const value = input
    .trim()
    .replace(/[۰-۹]/g, (c) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)))
    .replace(/[٠-٩]/g, (c) => String("٠١٢٣٤٥٦٧٨٩".indexOf(c)))
    .replace(/[,٬،\s]/g, "")
    .replace("٫", ".");
  return /^\d+(?:\.\d+)?$/.test(value) ? Number(value) : NaN;
}
