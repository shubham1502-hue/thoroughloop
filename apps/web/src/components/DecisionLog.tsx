"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  STORAGE_KEYS,
  readCollection,
  removeCollectionItem,
  replaceCollectionItem,
  type SavedDecision,
  type Status
} from "@thoroughloop/core";
import { webLocalStorageAdapter } from "@/storage/webLocalStorageAdapter";

const statusValues: Status[] = ["Open", "In Progress", "Done", "Blocked", "Reviewed"];

const inputClass =
  "rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/15";

export function DecisionLog() {
  const [decisions, setDecisions] = useState<SavedDecision[]>([]);
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    void readCollection<SavedDecision>(webLocalStorageAdapter, STORAGE_KEYS.decisions).then(setDecisions);
  }, []);

  function updateDraft(item: SavedDecision) {
    setDecisions((current) => current.map((decision) => (decision.id === item.id ? item : decision)));
  }

  async function saveDecision(item: SavedDecision) {
    const nextDecisions = await replaceCollectionItem(webLocalStorageAdapter, STORAGE_KEYS.decisions, item);
    setDecisions(nextDecisions);
    setConfirmation("Decision updated");
  }

  async function deleteDecision(id: string) {
    const nextDecisions = await removeCollectionItem<SavedDecision>(webLocalStorageAdapter, STORAGE_KEYS.decisions, id);
    setDecisions(nextDecisions);
    setConfirmation("");
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 md:px-8">
      <div className="grid gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Decision Log</p>
        <h1 className="text-4xl font-semibold tracking-normal">Decisions to review next week</h1>
      </div>

      {confirmation ? <p className="text-sm font-semibold text-forest">{confirmation}</p> : null}

      {decisions.length ? (
        <div className="grid gap-4">
          {decisions.map((decision) => (
            <article key={decision.id} className="rounded-lg border border-line bg-white p-5 shadow-soft">
              <div className="grid gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-muted">{decision.workflow}</p>
                    <h2 className="mt-1 text-2xl font-semibold">{decision.decisionRecommended}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteDecision(decision.id)}
                    className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-[#8f2f2f]"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold">Evidence used</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{decision.evidenceUsed}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Action assigned</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{decision.actionAssigned}</p>
                  </div>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">Owner</span>
                    <input className={inputClass} value={decision.owner} onChange={(event) => updateDraft({ ...decision, owner: event.target.value })} />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">Metric to watch</span>
                    <input
                      className={inputClass}
                      value={decision.metricToWatch}
                      onChange={(event) => updateDraft({ ...decision, metricToWatch: event.target.value })}
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">Review date</span>
                    <input
                      className={inputClass}
                      type="date"
                      value={decision.reviewDate}
                      onChange={(event) => updateDraft({ ...decision, reviewDate: event.target.value })}
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">Status</span>
                    <select className={inputClass} value={decision.status} onChange={(event) => updateDraft({ ...decision, status: event.target.value as Status })}>
                      {statusValues.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 md:col-span-2">
                    <span className="text-sm font-semibold">Outcome note</span>
                    <textarea
                      className={inputClass}
                      rows={3}
                      value={decision.outcomeNote}
                      onChange={(event) => updateDraft({ ...decision, outcomeNote: event.target.value })}
                    />
                  </label>
                </div>

                <div>
                  <button type="button" onClick={() => void saveDecision(decision)} className="rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white">
                    Save update
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 rounded-lg border border-line bg-white p-6 text-muted">
          <p className="font-semibold text-ink">No decisions saved yet.</p>
          <p>This page stores the decision to review next week after a founder memo is generated. It is empty because no decision has been saved on this device yet.</p>
          <p>
            Generate a founder memo from the{" "}
            <Link href="/" className="font-semibold text-forest underline underline-offset-4">
              homepage
            </Link>{" "}
            and save its decision.
          </p>
        </div>
      )}
    </div>
  );
}
