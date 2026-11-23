export function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

export function optStr(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return v === "" ? null : v;
}

export function numField(fd: FormData, key: string): number {
  const v = Number(str(fd, key));
  return Number.isFinite(v) ? v : NaN;
}

export function optNum(fd: FormData, key: string): number | null {
  const s = str(fd, key);
  if (s === "") return null;
  const v = Number(s);
  return Number.isFinite(v) ? v : null;
}
