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
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 md:px-8">
          <h2 className="text-2xl font-semibold text-white">Why founders churn from other tools</h2>
          <div className="grid gap-3 md:grid-cols-5">
            {churnReasons.map((reason) => (
              <div key={reason} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="font-semibold">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-night text-slate-100">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 md:px-8">
          <h2 className="text-2xl font-semibold text-white">What ThoroughLoop does instead</h2>
          <div className="grid gap-3 md:grid-cols-5">
            {thoroughLoopActions.map((action) => (
              <div key={action} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="font-semibold">{action}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
