import Link from "next/link";
import { WORKFLOWS } from "@thoroughloop/core";

export default function WorkflowsPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:px-8">
      <div className="grid gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Workflows</p>
        <h1 className="text-4xl font-semibold tracking-normal">Choose the operating loop to diagnose</h1>
        <p className="max-w-3xl text-lg leading-8 text-muted">
          Pick the workflow that matches the messy context in front of you. Each one produces the same founder memo, founder action, and decision loop.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {WORKFLOWS.map((workflow) => (
          <article key={workflow.id} className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="flex h-full flex-col gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{workflow.name}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{workflow.problemItSolves}</p>
              </div>
              <div className="grid gap-3 text-sm">
                <div>
                  <p className="font-semibold">Best input to paste</p>
                  <p className="text-muted">{workflow.bestInputToPaste}</p>
                </div>
                <div>
                  <p className="font-semibold">Output generated</p>
                  <p className="text-muted">{workflow.outputGenerated}</p>
                </div>
                <div>
                  <p className="font-semibold">Estimated time</p>
                  <p className="text-muted">{workflow.estimatedTime}</p>
                </div>
              </div>
              <div className="mt-auto pt-2">
                <Link href={workflow.path} className="inline-flex rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white">
                  Open workflow
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
