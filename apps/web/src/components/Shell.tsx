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
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2.5 sm:px-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-4">
          <Link href="/" className="text-lg font-semibold tracking-normal text-white md:text-xl">
            ThoroughLoop
          </Link>
          <nav className="grid grid-cols-4 gap-1 text-center text-[0.68rem] text-slate-300 sm:flex sm:flex-wrap sm:gap-2 sm:text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-9 items-center justify-center rounded-md border border-transparent px-1 py-1.5 leading-tight transition hover:border-cyan/40 hover:bg-white/5 hover:text-white sm:block sm:min-h-0 sm:px-3 sm:py-2"
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
