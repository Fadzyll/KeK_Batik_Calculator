export function rm(value: number | string | null | undefined, digits = 2): string {
  const n = Number(value ?? 0);
  return `RM${n.toLocaleString("en-MY", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

export function num(value: number | string | null | undefined, digits = 2): string {
  const n = Number(value ?? 0);
  return n.toLocaleString("en-MY", { maximumFractionDigits: digits });
}

export function formatDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
}

/** Today's date (YYYY-MM-DD) in Malaysia time. */
export function todayMY(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });
}

export const UNITS = ["g", "kg", "ml", "l", "pcs", "tbsp", "tsp", "cup"];

/** Current month (YYYY-MM) in Malaysia time. */
export function thisMonthMY(): string {
  return todayMY().slice(0, 7);
}

/** First day of the month and first day of the next month for a YYYY-MM string. */
export function monthRange(month: string): { start: string; end: string } {
  const [y, m] = month.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const ny = m === 12 ? y + 1 : y;
  const nm = m === 12 ? 1 : m + 1;
  return { start, end: `${ny}-${String(nm).padStart(2, "0")}-01` };
}

export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-MY", { month: "long", year: "numeric" });
}

export function validMonth(month: string | undefined): string {
  return month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : thisMonthMY();
}
