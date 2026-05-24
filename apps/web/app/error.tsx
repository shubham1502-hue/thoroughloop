"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto grid max-w-3xl gap-5 px-5 py-16 md:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Something went wrong</p>
      <h1 className="text-4xl font-semibold tracking-normal">The loop could not finish loading.</h1>
      <p className="text-muted">
        ThoroughLoop stores MVP data locally in this browser. If this keeps happening, check whether local browser storage was changed or cleared, then try again.
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white">
          Try again
        </button>
        <Link href="/" className="rounded-md border border-line px-4 py-2 text-sm font-semibold">
          Return home
        </Link>
      </div>
    </main>
  );
}
