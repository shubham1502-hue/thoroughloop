import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid max-w-3xl gap-5 px-5 py-16 md:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Page not found</p>
      <h1 className="text-4xl font-semibold tracking-normal">This ThoroughLoop route does not exist.</h1>
      <p className="text-muted">
        Use the main workflow loop, saved memos, founder action queue, decision log, or settings routes to continue.
      </p>
      <Link href="/" className="w-fit rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white">
        Return home
      </Link>
    </main>
  );
}
