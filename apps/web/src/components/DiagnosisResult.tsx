"use client";

import Link from "next/link";
import type { FounderDiagnosis, MemoAssumption, SavedMemo } from "@thoroughloop/core";

const inputClass =
  "w-full rounded-md border border-white/10 bg-night px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan focus:ring-2 focus:ring-cyan/20";

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

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
          <p className="text-sm font-semibold text-white">Matched keywords</p>
          <TagList values={diagnosis.matchedKeywords} emptyLabel="No strong match" />
        </div>
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-white">Extracted companies or deal names</p>
          <TagList values={diagnosis.extractedCompaniesOrDeals} emptyLabel="None detected" />
        </div>
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-white">Extracted risk signals</p>
          <TagList values={diagnosis.extractedRiskSignals} emptyLabel="Context is too thin to extract strong risk signals" />
        </div>
        <div className="grid gap-2">
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

export function EditableMemo({
  memo,
  onChange
}: {
  memo: SavedMemo;
  onChange: (memo: SavedMemo) => void;
}) {
  function update<K extends keyof SavedMemo>(key: K, value: SavedMemo[K]) {
    onChange({ ...memo, [key]: value });
  }

  function updateAssumption(index: number, key: keyof MemoAssumption, value: string) {
    const assumptionsMade = memo.assumptionsMade.map((item, currentIndex) =>
      currentIndex === index ? { ...item, [key]: value } : item
    );
    update("assumptionsMade", assumptionsMade);
  }

  return (
    <section data-testid="founder-memo" className="rounded-lg border border-white/10 bg-night-card p-4 text-slate-100 shadow-dark-soft sm:p-5">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
        <p className="text-sm font-semibold text-cyan">Founder memo</p>
        <input
          value={memo.title}
          onChange={(event) => update("title", event.target.value)}
          className="rounded-md border border-white/10 bg-night px-3 py-2 text-lg font-semibold text-white outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 sm:text-xl"
        />
      </div>

      <div className="mt-5 grid gap-4">
        <Field label="Problem">
          <textarea className={inputClass} rows={3} value={memo.problem} onChange={(event) => update("problem", event.target.value)} />
        </Field>
        <Field label="Evidence">
          <textarea className={inputClass} rows={3} value={memo.evidence} onChange={(event) => update("evidence", event.target.value)} />
        </Field>
        <Field label="Diagnosis">
          <textarea className={inputClass} rows={3} value={memo.diagnosis} onChange={(event) => update("diagnosis", event.target.value)} />
        </Field>
        <Field label="Recommended decision">
          <textarea
            className={inputClass}
            rows={2}
            value={memo.recommendedDecision}
            onChange={(event) => update("recommendedDecision", event.target.value)}
          />
        </Field>
        <Field label="Founder action">
          <textarea
            className={inputClass}
            rows={2}
            value={memo.founderAction}
            onChange={(event) => update("founderAction", event.target.value)}
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Owner">
            <input className={inputClass} value={memo.owner} onChange={(event) => update("owner", event.target.value)} />
          </Field>
          <Field label="Due date">
            <input className={inputClass} type="date" value={memo.dueDate} onChange={(event) => update("dueDate", event.target.value)} />
          </Field>
          <Field label="Workflow">
            <input className={inputClass} value={memo.workflow} readOnly />
          </Field>
        </div>

        <Field label="Metric to watch">
          <textarea
            className={inputClass}
            rows={2}
            value={memo.metricToWatch}
            onChange={(event) => update("metricToWatch", event.target.value)}
          />
        </Field>
        <Field label="What to ignore this week">
          <textarea
            className={inputClass}
            rows={2}
            value={memo.ignoreThisWeek}
            onChange={(event) => update("ignoreThisWeek", event.target.value)}
          />
        </Field>

        <div className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Assumptions made</p>
          {memo.assumptionsMade.map((item, index) => (
            <div key={`${item.assumption}-${index}`} className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <Field label="Assumption">
                <input className={inputClass} value={item.assumption} onChange={(event) => updateAssumption(index, "assumption", event.target.value)} />
              </Field>
              <Field label="Why it matters">
                <input
                  className={inputClass}
                  value={item.whyItMatters}
                  onChange={(event) => updateAssumption(index, "whyItMatters", event.target.value)}
                />
              </Field>
              <Field label="What to verify next">
                <input
                  className={inputClass}
                  value={item.whatToVerifyNext}
                  onChange={(event) => updateAssumption(index, "whatToVerifyNext", event.target.value)}
                />
              </Field>
            </div>
          ))}
        </div>

        <Field label="Investor-safe summary">
          <textarea
            className={inputClass}
            rows={3}
            value={memo.investorSafeSummary}
            onChange={(event) => update("investorSafeSummary", event.target.value)}
          />
        </Field>
      </div>
    </section>
  );
}

export function SaveActions({
  confirmation,
  onSaveMemo,
  onSaveAction,
  onSaveDecision
}: {
  confirmation: string;
  onSaveMemo: () => void;
  onSaveAction: () => void;
  onSaveDecision: () => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-slate-100">
      <div className="grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
        <button
          type="button"
          data-testid="save-memo"
          onClick={onSaveMemo}
          className="rounded-md bg-cyan px-4 py-2.5 text-sm font-semibold text-night transition hover:bg-cyan-soft sm:w-auto sm:py-2"
        >
          Save memo
        </button>
        <button
          type="button"
          data-testid="save-founder-action"
          onClick={onSaveAction}
          className="rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-cyan/50 hover:bg-white/10 sm:w-auto sm:py-2"
        >
          Save founder action
        </button>
        <button
          type="button"
          data-testid="save-decision"
          onClick={onSaveDecision}
          className="rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-cyan/50 hover:bg-white/10 sm:w-auto sm:py-2"
        >
          Save decision
        </button>
      </div>
      {confirmation ? <p className="mt-3 text-sm font-semibold text-cyan-soft">{confirmation}</p> : null}
    </div>
  );
}

export { inputClass };
