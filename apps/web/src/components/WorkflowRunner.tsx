"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CONTEXT_SOURCE_OPTIONS,
  DEFAULT_CONTEXT_SOURCE_ID,
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  buildReviewCalendarIcs,
  contextSourceForId,
  createDiagnosis,
  formatLoopTextBackup,
  formatMemoForCopy,
  formatReviewReminder,
  generateFounderMemo,
  generateInvestorUpdateVersions,
  getWorkflowById,
  readCollection,
  readJson,
  replaceCollectionItem,
  reviewDateForMemo,
  safeFileDate,
  saveSavedLoop,
  type ContextSourceId,
  type FounderDiagnosis,
  type SavedDecision,
  type SavedMemo,
  type Settings,
  type Status,
  type StructuredContextField,
  type WorkflowId
} from "@thoroughloop/core";
import { DiagnosisPreview, inputClass } from "@/components/DiagnosisResult";
import { CanonicalLoopResult, downloadClientFile } from "@/components/HomeLoop";
import { useNotionExport } from "@/hooks/useNotionExport";
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

function structuredContextFromFields(
  fields: FieldSpec[],
  values: Record<string, string>
): StructuredContextField[] {
  return fields
    .map((field) => ({
      key: field.key,
      label: field.label.replace(/\?$/, ""),
      value: values[field.key]?.trim() ?? ""
    }))
    .filter((field) => field.value);
}

function CopyBlock({ label, value }: { label: string; value: string }) {
  async function copy() {
    await navigator.clipboard.writeText(value);
  }

  return (
    <div data-ui-surface="light" className="surface-light grid gap-2 rounded-lg border border-line bg-white p-4">
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
    <section data-ui-surface="light" className="surface-light rounded-lg border border-line bg-white p-4 shadow-soft sm:p-5">
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
            <button type="button" onClick={saveReviewUpdate} className="w-full rounded-md bg-forest px-4 py-2.5 text-sm font-semibold text-white sm:w-auto sm:py-2">
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
  const [selectedSourceId, setSelectedSourceId] = useState<ContextSourceId>(DEFAULT_CONTEXT_SOURCE_ID);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [diagnosis, setDiagnosis] = useState<FounderDiagnosis | null>(null);
  const [memo, setMemo] = useState<SavedMemo | null>(null);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedReviewDate, setSavedReviewDate] = useState("");
  const [retentionMessage, setRetentionMessage] = useState("");
  const [retentionError, setRetentionError] = useState("");
  const { status: notionStatus, exportToNotion, reset: resetNotion } = useNotionExport();

  useEffect(() => {
    void readJson<Settings>(webLocalStorageAdapter, STORAGE_KEYS.settings, DEFAULT_SETTINGS).then(setSettings);
    void readCollection<SavedMemo>(webLocalStorageAdapter, STORAGE_KEYS.memos).then(setSavedMemos);
  }, []);

  const selectedMemo = savedMemos.find((item) => item.id === selectedMemoId);
  const selectedMemoText = selectedMemo ? formatMemoForCopy(selectedMemo) : "";
  const sourceInput =
    workflowId === "investor-update" && selectedMemoText
      ? [selectedMemoText, rawInput.trim()].filter(Boolean).join("\n\n")
      : rawInput.trim();
  const structuredContext = structuredContextFromFields(fields, fieldValues);
  const selectedSource = contextSourceForId(selectedSourceId);
  const hasContext = Boolean(sourceInput || structuredContext.length);

  function updateField(key: string, value: string) {
    setFieldValues((current) => ({ ...current, [key]: value }));
  }

  function runDiagnosis() {
    const nextDiagnosis = createDiagnosis(sourceInput, workflowId, selectedSourceId, structuredContext);
    setDiagnosis(nextDiagnosis);
    setMemo(null);
    setCopiedMemo(false);
    setSaved(false);
    setSavedReviewDate("");
    setRetentionMessage("");
    setRetentionError("");
    resetNotion();
  }

  function generateMemo() {
    if (!diagnosis) {
      return;
    }

    setMemo(generateFounderMemo(diagnosis, settings));
    setCopiedMemo(false);
    setSaved(false);
    setSavedReviewDate("");
    setRetentionMessage("");
    setRetentionError("");
    resetNotion();
  }

  function updateMemo(patch: Partial<SavedMemo>) {
    setMemo((current) => (current ? { ...current, ...patch } : current));
    setCopiedMemo(false);
    setSaved(false);
    setSavedReviewDate("");
    setRetentionMessage("");
    setRetentionError("");
    resetNotion();
  }

  async function copyMemo() {
    if (!memo) {
      return;
    }

    await navigator.clipboard.writeText(formatMemoForCopy(memo));
    setCopiedMemo(true);
  }

  async function saveLoop() {
    if (!memo) {
      return;
    }

    try {
      const savedLoop = await saveSavedLoop(webLocalStorageAdapter, memo);
      setSavedMemos(savedLoop.memos);
      setSavedReviewDate(savedLoop.records.decision.reviewDate);
      setSaved(true);
      setRetentionMessage("");
      setRetentionError("");
    } catch {
      setSaved(false);
      setRetentionMessage("");
      setRetentionError("Could not save the complete loop locally. No complete save was confirmed.");
    }
  }

  function downloadReviewCalendar() {
    if (!memo) {
      return;
    }

    const reviewDate = reviewDateForMemo(memo, { decisionReviewDate: savedReviewDate });
    downloadClientFile(
      `thoroughloop-review-${safeFileDate(reviewDate)}.ics`,
      buildReviewCalendarIcs(memo, { decisionReviewDate: savedReviewDate }),
      "text/calendar;charset=utf-8"
    );
    setRetentionMessage("Review calendar downloaded");
    setRetentionError("");
  }

  async function copyReviewReminder() {
    if (!memo) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        formatReviewReminder(memo, { decisionReviewDate: savedReviewDate })
      );
      setRetentionMessage("Review reminder copied");
      setRetentionError("");
    } catch {
      setRetentionMessage("");
      setRetentionError("Could not copy reminder. You can still download the loop as text.");
    }
  }

  function downloadLoopText() {
    if (!memo) {
      return;
    }

    const reviewDate = reviewDateForMemo(memo, { decisionReviewDate: savedReviewDate });
    downloadClientFile(
      `thoroughloop-loop-${safeFileDate(reviewDate)}.txt`,
      formatLoopTextBackup(memo, { decisionReviewDate: savedReviewDate }),
      "text/plain;charset=utf-8"
    );
    setRetentionMessage("Loop text downloaded");
    setRetentionError("");
  }

  async function exportCurrentMemoToNotion() {
    if (memo) {
      await exportToNotion(memo);
    }
  }

  function startNewLoop() {
    setRawInput("");
    setFieldValues({});
    setSelectedMemoId("");
    setSelectedSourceId(DEFAULT_CONTEXT_SOURCE_ID);
    setDiagnosis(null);
    setMemo(null);
    setCopiedMemo(false);
    setSaved(false);
    setSavedReviewDate("");
    setRetentionMessage("");
    setRetentionError("");
    resetNotion();
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

  if (diagnosis && memo) {
    return (
      <CanonicalLoopResult
        diagnosis={diagnosis}
        memo={memo}
        selectedSampleId={null}
        copied={copiedMemo}
        saved={saved}
        savedReviewDate={savedReviewDate}
        retentionMessage={retentionMessage}
        retentionError={retentionError}
        notionState={notionStatus}
        onStartNew={startNewLoop}
        onCopyMemo={copyMemo}
        onSaveLoop={saveLoop}
        onDownloadCalendar={downloadReviewCalendar}
        onCopyReviewReminder={copyReviewReminder}
        onDownloadLoopText={downloadLoopText}
        onExportToNotion={exportCurrentMemoToNotion}
        onUpdateMemo={updateMemo}
        supplementalContent={
          investorVersions ? (
            <section className="grid gap-4">
              <h2 className="text-2xl font-semibold text-white">Copyable investor versions</h2>
              <CopyBlock label="Full investor update" value={investorVersions.fullInvestorUpdate} />
              <CopyBlock label="WhatsApp short version" value={investorVersions.whatsappShortVersion} />
              <CopyBlock label="Board-style version" value={investorVersions.boardStyleVersion} />
            </section>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-5 px-4 py-8 sm:px-5 md:gap-6 md:px-8 md:py-10">
      <div className="grid gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Workflow</p>
        <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">{workflow.name}</h1>
        <p className="max-w-3xl text-base leading-7 text-muted sm:text-lg sm:leading-8">{workflow.purpose}</p>
      </div>

      {workflowId === "weekly-review" ? <PreviousDecisionReview /> : null}

      <section data-ui-surface="light" className="surface-light rounded-lg border border-line bg-white p-4 shadow-soft sm:p-5">
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

          <label className="grid gap-2">
            <span className="text-sm font-semibold">Where is this context coming from?</span>
            <select
              className={inputClass}
              value={selectedSourceId}
              onChange={(event) => setSelectedSourceId(event.target.value as ContextSourceId)}
            >
              {CONTEXT_SOURCE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="text-sm leading-6 text-muted">{selectedSource.helperText}</span>
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
              disabled={!hasContext}
              className="w-full rounded-md bg-forest px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9a9a92] sm:w-auto sm:py-2"
            >
              Diagnose this mess
            </button>
          </div>
        </div>
      </section>

      {diagnosis ? <DiagnosisPreview diagnosis={diagnosis} onGenerateMemo={generateMemo} /> : null}

    </div>
  );
}
