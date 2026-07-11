"use client";

import Link from "next/link";
import type { FounderDiagnosis } from "@thoroughloop/core";

const inputClass =
  "control-dark w-full rounded-md border border-white/10 bg-night px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan focus:ring-2 focus:ring-cyan/20";

function TagList({ values, emptyLabel }: { values: string[]; emptyLabel: string }) {
  const list = values.length ? values : [emptyLabel];

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((value) => (
        <span key={value} className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300">
          {value}
        </span>
      ))}
    </div>
  );
}

export function DiagnosisPreview({
  diagnosis,
  onGenerateMemo
}: {
  diagnosis: FounderDiagnosis;
  onGenerateMemo: () => void;
}) {
  return (
    <section data-testid="diagnosis-preview" className="rounded-lg border border-white/10 bg-night-card p-4 text-slate-100 shadow-dark-soft sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-cyan">Diagnosis preview</p>
          <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">{diagnosis.workflow.name}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{diagnosis.recommendedNextStep}</p>
        </div>
        <div className="w-fit rounded-md border border-cyan/30 bg-cyan/10 px-3 py-2 text-sm text-cyan-soft">
          Confidence: <span className="font-semibold">{diagnosis.confidence}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-white">Operating signals</p>
          <TagList values={diagnosis.matchedKeywords} emptyLabel="No strong match" />
        </div>
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-white">Named context</p>
          <TagList values={diagnosis.extractedCompaniesOrDeals} emptyLabel="None detected" />
        </div>
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-white">Risk signals</p>
          <TagList values={diagnosis.extractedRiskSignals} emptyLabel="Context is too thin to extract strong risk signals" />
        </div>
        <div data-testid="diagnosis-missing-context" className="grid gap-2">
          <p className="text-sm font-semibold text-white">Missing context</p>
          <TagList values={diagnosis.missingContext} emptyLabel="None detected" />
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
        <button
          type="button"
          onClick={onGenerateMemo}
          className="rounded-md bg-cyan px-4 py-2.5 text-sm font-semibold text-night transition hover:bg-cyan-soft sm:w-auto sm:py-2"
        >
          Generate founder memo
        </button>
        <Link
          href={diagnosis.workflow.path}
          className="rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:border-cyan/50 hover:bg-white/10 sm:w-auto sm:py-2"
        >
          Open full workflow
        </Link>
      </div>
    </section>
  );
}

export { inputClass };
