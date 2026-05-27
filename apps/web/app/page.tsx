import { HomeLoop } from "@/components/HomeLoop";

const churnReasons = [
  "Too much setup",
  "Too much data hygiene",
  "Empty dashboards",
  "Too many tasks",
  "Not enough judgment"
];

const thoroughLoopActions = [
  "Accepts messy input",
  "Extracts operating signals",
  "Diagnoses the bottleneck",
  "Recommends one founder action",
  "Saves the decision for next week"
];

export default function HomePage() {
  return (
    <>
      <HomeLoop />
      <section className="border-t border-white/10 bg-night-soft text-slate-100">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:px-5 md:gap-6 md:px-8 md:py-12">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">Why founders churn from other tools</h2>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-5 md:gap-3">
            {churnReasons.map((reason) => (
              <div key={reason} className="rounded-lg border border-white/10 bg-white/[0.04] p-3 md:p-4">
                <p className="font-semibold">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-night text-slate-100">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:px-5 md:gap-6 md:px-8 md:py-12">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">What ThoroughLoop does instead</h2>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-5 md:gap-3">
            {thoroughLoopActions.map((action) => (
              <div key={action} className="rounded-lg border border-white/10 bg-white/[0.04] p-3 md:p-4">
                <p className="font-semibold">{action}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
