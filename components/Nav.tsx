"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/ingredients", label: "Ingredients", icon: "🧂" },
  { href: "/recipes", label: "Pricing", icon: "🍫" },
  { href: "/expenses", label: "Expenses", icon: "🧾" },
  { href: "/sales", label: "Sales", icon: "💰" },
];

export function Nav({ email }: { email: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-cocoa-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="font-bold text-cocoa-800">
            🍫 Kek Batik Manager
          </Link>
          <nav className="hidden gap-1 sm:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  isActive(l.href) ? "bg-cocoa-700 text-white" : "text-cocoa-700 hover:bg-cocoa-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <form action="/auth/signout" method="post" className="flex items-center gap-2">
            <span className="hidden text-xs text-cocoa-500 md:inline">{email}</span>
            <button className="btn-ghost">Log out</button>
          </form>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-cocoa-200 bg-white sm:hidden">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
              isActive(l.href) ? "text-cocoa-800" : "text-cocoa-400"
            }`}
          >
            <span className="text-lg leading-none">{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
