"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  appendCollectionItem,
  createDiagnosis,
  generateFounderMemo,
  memoToDecision,
  memoToFounderAction,
  readJson,
  type FounderDiagnosis,
  type SavedMemo,
  type Settings
} from "@thoroughloop/core";
import { DiagnosisPreview, EditableMemo, SaveActions } from "@/components/DiagnosisResult";
import { webLocalStorageAdapter } from "@/storage/webLocalStorageAdapter";

const sampleContext =
  "FinCore Labs has been stuck in negotiation for 21 days after raising a pricing concern. BrightLayer AI has not replied after proposal for 12 days. Northstar Ops completed demo but is waiting for internal review. Founder follow-up is slipping and proposal-stage deals need attention this week.";

const valueStrip = ["1 diagnosis", "1 founder action", "1 decision"];

export function HomeLoop() {
  const [rawInput, setRawInput] = useState("");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [diagnosis, setDiagnosis] = useState<FounderDiagnosis | null>(null);
  const [memo, setMemo] = useState<SavedMemo | null>(null);
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    void readJson<Settings>(webLocalStorageAdapter, STORAGE_KEYS.settings, DEFAULT_SETTINGS).then(setSettings);
  }, []);

  function runDiagnosis(input: string) {
    const nextDiagnosis = createDiagnosis(input);
    setDiagnosis(nextDiagnosis);
    setMemo(null);
    setConfirmation("");
  }

  function trySampleDiagnosis() {
    setRawInput(sampleContext);
    runDiagnosis(sampleContext);
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

  return (
    <section className="border-b border-white/10 bg-night text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:px-8 md:py-16">
        <div className="grid gap-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">ThoroughLoop</p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal md:text-7xl">
            Paste messy founder context. Close the loop.
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">
            ThoroughLoop turns scattered founder notes into one diagnosis, one founder action, and one decision to review next week.
          </p>
          <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
            {valueStrip.map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-soft">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-night-card p-5 shadow-dark-soft md:p-6">
          <label className="grid gap-3">
            <span className="text-sm font-semibold text-slate-100">Messy founder context</span>
            <textarea
              data-testid="messy-context-input"
              value={rawInput}
              onChange={(event) => setRawInput(event.target.value)}
              rows={9}
              placeholder="Paste deal notes, weekly updates, CRM exports, customer blockers, investor notes, hiring notes, or founder reflections here."
              className="min-h-[240px] rounded-lg border border-white/10 bg-night px-4 py-3 text-base leading-7 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan focus:ring-2 focus:ring-cyan/20"
            />
          </label>
          <p className="mt-3 text-sm text-slate-400">Paste at least one messy note, or try the sample diagnosis.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={trySampleDiagnosis}
              className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan/50 hover:bg-white/10"
            >
              Try sample diagnosis
            </button>
            <button
              type="button"
              onClick={() => runDiagnosis(rawInput)}
              disabled={!rawInput.trim()}
              className="rounded-md bg-cyan px-4 py-2 text-sm font-semibold text-night transition hover:bg-cyan-soft disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              Diagnose this mess
            </button>
          </div>
        </div>

        {diagnosis ? <DiagnosisPreview diagnosis={diagnosis} onGenerateMemo={generateMemo} /> : null}
        {memo ? (
          <div className="grid gap-4">
            <EditableMemo memo={memo} onChange={setMemo} />
            <SaveActions
              confirmation={confirmation}
              onSaveMemo={saveMemo}
              onSaveAction={saveFounderAction}
              onSaveDecision={saveDecision}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
