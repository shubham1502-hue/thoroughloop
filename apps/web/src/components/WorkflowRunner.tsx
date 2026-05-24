"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  appendCollectionItem,
  createDiagnosis,
  formatMemoForCopy,
  generateFounderMemo,
  generateInvestorUpdateVersions,
  getWorkflowById,
  memoToDecision,
  memoToFounderAction,
  readCollection,
  readJson,
  replaceCollectionItem,
  type FounderDiagnosis,
  type SavedDecision,
  type SavedMemo,
  type Settings,
  type Status,
  type WorkflowId
} from "@thoroughloop/core";
import { DiagnosisPreview, EditableMemo, SaveActions, inputClass } from "@/components/DiagnosisResult";
import { webLocalStorageAdapter } from "@/storage/webLocalStorageAdapter";

type FieldSpec = {
  key: string;
  label: string;
  multiline?: boolean;
};

const fieldSets: Partial<Record<WorkflowId, FieldSpec[]>> = {
  "revenue-rescue": [
    { key: "dealName", label: "Deal name" },
    { key: "dealValue", label: "Deal value" },
    { key: "stage", label: "Stage" },
    { key: "owner", label: "Owner" },
    { key: "daysStuck", label: "Days stuck" },
    { key: "lastActivity", label: "Last activity" },
    { key: "stuckReason", label: "Stuck reason", multiline: true },
    { key: "nextStep", label: "Next step", multiline: true }
  ],
  "onboarding-risk": [
    { key: "customerName", label: "Customer name" },
    { key: "dealValue", label: "Deal value" },
    { key: "closeDate", label: "Close date" },
    { key: "onboardingStage", label: "Onboarding stage" },
    { key: "daysSinceClose", label: "Days since close" },
    { key: "blocker", label: "Blocker", multiline: true },
    { key: "sentiment", label: "Sentiment" },
    { key: "owner", label: "Owner" },
    { key: "nextMilestone", label: "Next milestone", multiline: true }
  ],
  "hiring-bottleneck": [
    { key: "role", label: "Role" },
    { key: "candidate", label: "Candidate" },
    { key: "stage", label: "Stage" },
    { key: "daysInStage", label: "Days in stage" },
    { key: "skillFit", label: "Skill fit" },
    { key: "cultureFit", label: "Culture fit" },
    { key: "riskNotes", label: "Risk notes", multiline: true },
    { key: "nextStep", label: "Next step", multiline: true },
    { key: "owner", label: "Owner" }
  ],
  "weekly-review": [
    { key: "moved", label: "What moved this week?", multiline: true },
    { key: "stuck", label: "What got stuck?", multiline: true },
    { key: "surprised", label: "What surprised you?", multiline: true },
    { key: "decisions", label: "What decisions need founder attention?", multiline: true },
    { key: "nextWeek", label: "What must happen next week?", multiline: true },
    { key: "revenueThisWeek", label: "Revenue this week" },
    { key: "revenueLastWeek", label: "Revenue last week" },
    { key: "leads", label: "Leads" },
    { key: "demos", label: "Demos" },
    { key: "dealsClosed", label: "Deals closed" },
    { key: "activationRate", label: "Activation rate" },
    { key: "churnRiskNotes", label: "Churn risk notes", multiline: true }
  ],
  "investor-update": [
    { key: "reportingPeriod", label: "Reporting period" },
    { key: "keyWins", label: "Key wins", multiline: true },
    { key: "keyRisks", label: "Key risks", multiline: true },
    { key: "investorAsks", label: "Investor asks", multiline: true }
  ]
};

const statusValues: Status[] = ["Open", "In Progress", "Done", "Blocked", "Reviewed"];

function composeContext(rawInput: string, fields: FieldSpec[], values: Record<string, string>): string {
  const structured = fields
    .map((field) => {
      const value = values[field.key]?.trim();
      return value ? `${field.label}: ${value}` : "";
    })
    .filter(Boolean)
    .join("\n");

  return [rawInput.trim(), structured].filter(Boolean).join("\n\n");
}

function CopyBlock({ label, value }: { label: string; value: string }) {
  async function copy() {
    await navigator.clipboard.writeText(value);
  }

  return (
    <div className="grid gap-2 rounded-lg border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{label}</p>
        <button type="button" onClick={copy} className="rounded-md border border-line px-3 py-1.5 text-sm font-semibold">
          Copy
        </button>
      </div>
      <textarea className={inputClass} rows={5} value={value} readOnly />
    </div>
  );
}

function PreviousDecisionReview() {
  const [latestDecision, setLatestDecision] = useState<SavedDecision | null>(null);
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    void readCollection<SavedDecision>(webLocalStorageAdapter, STORAGE_KEYS.decisions).then((items) => {
      const [latest] = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setLatestDecision(latest ?? null);
    });
  }, []);

  async function saveReviewUpdate() {
    if (!latestDecision) {
      return;
    }

    await replaceCollectionItem(webLocalStorageAdapter, STORAGE_KEYS.decisions, latestDecision);
    setConfirmation("Decision review updated");
  }

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <h2 className="text-xl font-semibold">Review previous decision</h2>
      {latestDecision ? (
        <div className="mt-4 grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">What was decided</p>
              <p className="mt-1">{latestDecision.decisionRecommended}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Action assigned</p>
              <p className="mt-1">{latestDecision.actionAssigned}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Owner</p>
              <p className="mt-1">{latestDecision.owner}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Metric to watch</p>
              <p className="mt-1">{latestDecision.metricToWatch}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Review date</p>
              <p className="mt-1">{latestDecision.reviewDate}</p>
            </div>
          </div>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Outcome note</span>
            <textarea
              className={inputClass}
              rows={3}
              value={latestDecision.outcomeNote}
              onChange={(event) => setLatestDecision({ ...latestDecision, outcomeNote: event.target.value })}
            />
          </label>
          <label className="grid gap-2 md:max-w-xs">
            <span className="text-sm font-semibold">Status</span>
            <select
              className={inputClass}
              value={latestDecision.status}
              onChange={(event) => setLatestDecision({ ...latestDecision, status: event.target.value as Status })}
            >
              {statusValues.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <div>
            <button type="button" onClick={saveReviewUpdate} className="rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white">
              Save review update
            </button>
            {confirmation ? <p className="mt-3 text-sm font-semibold text-forest">{confirmation}</p> : null}
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-2 text-muted">
          <p className="font-semibold text-ink">No previous founder decision saved yet.</p>
          <p>This section recalls the latest saved decision for weekly review. It is empty because no decision has been saved on this device yet.</p>
          <p>
            Generate your first diagnosis from the{" "}
            <Link href="/" className="font-semibold text-forest underline underline-offset-4">
              homepage
            </Link>
            .
          </p>
        </div>
      )}
    </section>
  );
}

export function WorkflowRunner({ workflowId }: { workflowId: WorkflowId }) {
  const workflow = getWorkflowById(workflowId);
  const fields = useMemo(() => fieldSets[workflowId] ?? [], [workflowId]);
  const [rawInput, setRawInput] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [savedMemos, setSavedMemos] = useState<SavedMemo[]>([]);
  const [selectedMemoId, setSelectedMemoId] = useState("");
  const [tone, setTone] = useState("Neutral");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [diagnosis, setDiagnosis] = useState<FounderDiagnosis | null>(null);
  const [memo, setMemo] = useState<SavedMemo | null>(null);
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    void readJson<Settings>(webLocalStorageAdapter, STORAGE_KEYS.settings, DEFAULT_SETTINGS).then(setSettings);
    void readCollection<SavedMemo>(webLocalStorageAdapter, STORAGE_KEYS.memos).then(setSavedMemos);
  }, []);

  const selectedMemo = savedMemos.find((item) => item.id === selectedMemoId);
  const selectedMemoText = selectedMemo ? formatMemoForCopy(selectedMemo) : "";
  const composedInput = composeContext(
    workflowId === "investor-update" && selectedMemoText ? `${selectedMemoText}\n\n${rawInput}` : rawInput,
    fields,
    fieldValues
  );

  function updateField(key: string, value: string) {
    setFieldValues((current) => ({ ...current, [key]: value }));
  }

  function runDiagnosis() {
    const nextDiagnosis = createDiagnosis(composedInput, workflowId);
    setDiagnosis(nextDiagnosis);
    setMemo(null);
    setConfirmation("");
  }

  function generateMemo() {
    if (!diagnosis) {
      return;
    }

    setMemo(generateFounderMemo(diagnosis, settings));
    setConfirmation("");
  }

  async function saveMemo() {
    if (!memo) {
      return;
    }

    await appendCollectionItem(webLocalStorageAdapter, STORAGE_KEYS.memos, memo);
    setConfirmation("Memo saved");
  }

  async function saveFounderAction() {
    if (!memo) {
      return;
    }

    await appendCollectionItem(webLocalStorageAdapter, STORAGE_KEYS.actions, memoToFounderAction(memo));
    setConfirmation("Founder action saved");
  }

  async function saveDecision() {
    if (!memo) {
      return;
    }

    await appendCollectionItem(webLocalStorageAdapter, STORAGE_KEYS.decisions, memoToDecision(memo));
    setConfirmation("Decision saved");
  }

  const investorVersions =
    workflowId === "investor-update" && memo
      ? generateInvestorUpdateVersions(memo, {
          reportingPeriod: fieldValues.reportingPeriod,
          keyWins: fieldValues.keyWins,
          keyRisks: fieldValues.keyRisks,
          investorAsks: fieldValues.investorAsks,
          tone
        })
      : null;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-5 py-10 md:px-8">
      <div className="grid gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Workflow</p>
        <h1 className="text-4xl font-semibold tracking-normal">{workflow.name}</h1>
        <p className="max-w-3xl text-lg leading-8 text-muted">{workflow.purpose}</p>
      </div>

      {workflowId === "weekly-review" ? <PreviousDecisionReview /> : null}

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="grid gap-5">
          {workflowId === "investor-update" ? (
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Select saved memo if available</span>
              <select className={inputClass} value={selectedMemoId} onChange={(event) => setSelectedMemoId(event.target.value)}>
                <option value="">Use fresh context</option>
                {savedMemos.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="grid gap-2">
            <span className="text-sm font-semibold">Messy context</span>
            <textarea
              className={inputClass}
              rows={8}
              value={rawInput}
              onChange={(event) => setRawInput(event.target.value)}
              placeholder="Paste the messy context for this workflow."
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <label key={field.key} className={field.multiline ? "grid gap-2 md:col-span-2" : "grid gap-2"}>
                <span className="text-sm font-semibold">{field.label}</span>
                {field.multiline ? (
                  <textarea
                    className={inputClass}
                    rows={3}
                    value={fieldValues[field.key] ?? ""}
                    onChange={(event) => updateField(field.key, event.target.value)}
                  />
                ) : (
                  <input className={inputClass} value={fieldValues[field.key] ?? ""} onChange={(event) => updateField(field.key, event.target.value)} />
                )}
              </label>
            ))}
          </div>

          {workflowId === "investor-update" ? (
            <label className="grid gap-2 md:max-w-xs">
              <span className="text-sm font-semibold">Tone</span>
              <select className={inputClass} value={tone} onChange={(event) => setTone(event.target.value)}>
                {["Conservative", "Confident", "Urgent", "Neutral"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div>
            <button
              type="button"
              onClick={runDiagnosis}
              disabled={!composedInput.trim()}
              className="rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9a9a92]"
            >
              Diagnose this mess
            </button>
          </div>
        </div>
      </section>

      {diagnosis ? <DiagnosisPreview diagnosis={diagnosis} onGenerateMemo={generateMemo} /> : null}

      {memo ? (
        <div className="grid gap-4">
          <EditableMemo memo={memo} onChange={setMemo} />
          {investorVersions ? (
            <section className="grid gap-4">
              <h2 className="text-2xl font-semibold">Copyable investor versions</h2>
              <CopyBlock label="Full investor update" value={investorVersions.fullInvestorUpdate} />
              <CopyBlock label="WhatsApp short version" value={investorVersions.whatsappShortVersion} />
              <CopyBlock label="Board-style version" value={investorVersions.boardStyleVersion} />
            </section>
          ) : null}
          <SaveActions
            confirmation={confirmation}
            onSaveMemo={saveMemo}
            onSaveAction={saveFounderAction}
            onSaveDecision={saveDecision}
          />
        </div>
      ) : null}
    </div>
  );
}
