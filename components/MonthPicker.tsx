"use client";

import { usePathname, useRouter } from "next/navigation";

export function MonthPicker({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <input
      type="month"
      value={month}
      onChange={(e) => e.target.value && router.push(`${pathname}?month=${e.target.value}`)}
      className="input w-auto"
      aria-label="Month"
    />
  );
}
