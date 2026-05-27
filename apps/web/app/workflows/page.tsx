import Link from "next/link";
import { WORKFLOWS } from "@thoroughloop/core";

export default function WorkflowsPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-5 md:gap-8 md:px-8 md:py-10">
      <div className="grid gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Workflows</p>
        <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">Choose the operating loop to diagnose</h1>
        <p className="max-w-3xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
          Pick the workflow that matches the messy context in front of you. Each one produces the same founder memo, founder action, and decision loop.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {WORKFLOWS.map((workflow) => (
          <article key={workflow.id} className="rounded-lg border border-line bg-white p-4 shadow-soft sm:p-5">
            <div className="flex h-full flex-col gap-4">
              <div>
                <h2 className="text-xl font-semibold sm:text-2xl">{workflow.name}</h2>
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
                <Link href={workflow.path} className="inline-flex w-full justify-center rounded-md bg-forest px-4 py-2.5 text-sm font-semibold text-white sm:w-auto sm:py-2">
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
