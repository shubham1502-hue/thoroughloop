import Link from "next/link";
import type { ReactNode } from "react";

const demoSurfaceLinks = [
  { href: "/memos", label: "Memos" },
  { href: "/action-queue", label: "Actions" },
  { href: "/decision-log", label: "Decisions" },
  { href: "/workflows", label: "Workflows" },
  { href: "/settings", label: "Settings" },
];

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-night text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-night/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-5 md:px-8">
          <Link href="/" className="text-lg font-semibold tracking-normal text-white md:text-xl">
            ThoroughLoop
          </Link>
          <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-300">
            Local
          </span>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-white/10 bg-night px-4 py-6 text-sm text-slate-500 sm:px-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center md:flex-row">
          <p>ThoroughLoop · runs locally in this browser</p>
          <nav aria-label="Demo surfaces" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-600">
              Demo surfaces
            </span>
            {demoSurfaceLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-1.5 py-1 text-slate-400 transition hover:text-[#d9a441] focus:outline-none focus:ring-2 focus:ring-[#d9a441]/30"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
