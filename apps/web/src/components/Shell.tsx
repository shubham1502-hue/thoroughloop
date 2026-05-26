import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/memos", label: "Memos" },
  { href: "/action-queue", label: "Founder Action Queue" },
  { href: "/decision-log", label: "Decision Log" },
  { href: "/settings", label: "Settings" }
];

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-night/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <Link href="/" className="text-xl font-semibold tracking-normal text-white">
            ThoroughLoop
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm text-slate-300">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-transparent px-3 py-2 transition hover:border-cyan/40 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
