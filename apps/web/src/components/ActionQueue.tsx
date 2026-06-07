"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  STORAGE_KEYS,
  WORKFLOWS,
  contextSourceLabelForId,
  readCollection,
  removeCollectionItem,
  replaceCollectionItem,
  type Priority,
  type SavedFounderAction,
  type Status,
  type WorkflowName
} from "@thoroughloop/core";
import { webLocalStorageAdapter } from "@/storage/webLocalStorageAdapter";

const statusValues: Status[] = ["Open", "In Progress", "Done", "Blocked", "Reviewed"];
const priorityValues: Priority[] = ["Low", "Medium", "High", "Critical"];

const inputClass =
  "rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/15";

export function ActionQueue() {
  const [actions, setActions] = useState<SavedFounderAction[]>([]);
  const [workflow, setWorkflow] = useState<WorkflowName | "All">("All");
  const [status, setStatus] = useState<Status | "All">("All");
  const [priority, setPriority] = useState<Priority | "All">("All");
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    void readCollection<SavedFounderAction>(webLocalStorageAdapter, STORAGE_KEYS.actions).then(setActions);
  }, []);

  const filteredActions = useMemo(
    () =>
      actions.filter((action) => {
        const matchesWorkflow = workflow === "All" || action.workflow === workflow;
        const matchesStatus = status === "All" || action.status === status;
        const matchesPriority = priority === "All" || action.priority === priority;
        return matchesWorkflow && matchesStatus && matchesPriority;
      }),
    [actions, priority, status, workflow]
  );

  function updateDraft(item: SavedFounderAction) {
    setActions((current) => current.map((action) => (action.id === item.id ? item : action)));
  }

  async function saveAction(item: SavedFounderAction) {
    const nextActions = await replaceCollectionItem(webLocalStorageAdapter, STORAGE_KEYS.actions, item);
    setActions(nextActions);
    setConfirmation("Founder action updated");
  }

  async function deleteAction(id: string) {
    const nextActions = await removeCollectionItem<SavedFounderAction>(webLocalStorageAdapter, STORAGE_KEYS.actions, id);
    setActions(nextActions);
    setConfirmation("");
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-5 md:gap-6 md:px-8 md:py-10">
      <div className="grid gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Founder Action Queue</p>
        <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">One action per memo</h1>
      </div>

      <div className="grid gap-3 rounded-lg border border-line bg-white p-3 sm:p-4 md:grid-cols-3">
        <select value={workflow} onChange={(event) => setWorkflow(event.target.value as WorkflowName | "All")} className={inputClass}>
          <option value="All">All workflows</option>
          {WORKFLOWS.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value as Status | "All")} className={inputClass}>
          <option value="All">All statuses</option>
          {statusValues.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select value={priority} onChange={(event) => setPriority(event.target.value as Priority | "All")} className={inputClass}>
          <option value="All">All priorities</option>
          {priorityValues.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {confirmation ? <p className="text-sm font-semibold text-forest">{confirmation}</p> : null}

      {filteredActions.length ? (
        <div className="grid gap-4">
          {filteredActions.map((action) => (
            <article key={action.id} className="rounded-lg border border-line bg-white p-4 shadow-soft sm:p-5">
              <div className="grid gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-muted">
                      {action.workflow} | Source: {contextSourceLabelForId(action.contextSource)}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold sm:text-2xl">{action.founderAction}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">{action.whyItMatters}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteAction(action.id)}
                    className="w-full rounded-md border border-line px-3 py-2 text-sm font-semibold text-[#8f2f2f] sm:w-fit"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">Owner</span>
                    <input className={inputClass} value={action.owner} onChange={(event) => updateDraft({ ...action, owner: event.target.value })} />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">Priority</span>
                    <select
                      className={inputClass}
                      value={action.priority}
                      onChange={(event) => updateDraft({ ...action, priority: event.target.value as Priority })}
                    >
                      {priorityValues.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">Due date</span>
                    <input className={inputClass} type="date" value={action.dueDate} onChange={(event) => updateDraft({ ...action, dueDate: event.target.value })} />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">Status</span>
                    <select className={inputClass} value={action.status} onChange={(event) => updateDraft({ ...action, status: event.target.value as Status })}>
                      {statusValues.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">Decision status</span>
                    <select
                      className={inputClass}
                      value={action.decisionStatus}
                      onChange={(event) => updateDraft({ ...action, decisionStatus: event.target.value as Status })}
                    >
                      {statusValues.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 md:col-span-3">
                    <span className="text-sm font-semibold">Metric to watch</span>
                    <input
                      className={inputClass}
                      value={action.metricToWatch}
                      onChange={(event) => updateDraft({ ...action, metricToWatch: event.target.value })}
                    />
                  </label>
                  <label className="grid gap-2 md:col-span-3">
                    <span className="text-sm font-semibold">Follow-up result</span>
                    <textarea
                      className={inputClass}
                      rows={3}
                      value={action.followUpResult}
                      onChange={(event) => updateDraft({ ...action, followUpResult: event.target.value })}
                    />
                  </label>
                </div>

                <div>
                  <button type="button" onClick={() => void saveAction(action)} className="w-full rounded-md bg-forest px-4 py-2.5 text-sm font-semibold text-white sm:w-auto sm:py-2">
                    Save update
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : actions.length ? (
        <div className="grid gap-3 rounded-lg border border-line bg-white p-6 text-muted">
          <p className="font-semibold text-ink">No founder actions match the current filters.</p>
          <p>This page keeps the one founder action saved from each memo. Clear the filters to return to the full founder action queue.</p>
        </div>
      ) : (
        <div className="grid gap-3 rounded-lg border border-line bg-white p-6 text-muted">
          <p className="font-semibold text-ink">No founder actions saved yet.</p>
          <p>This page tracks one founder action per saved memo. It is empty because no founder action has been saved on this device yet.</p>
          <p>
            Generate a founder memo from the{" "}
            <Link href="/" className="font-semibold text-forest underline underline-offset-4">
              homepage
            </Link>{" "}
            and save its founder action.
          </p>
        </div>
      )}
    </div>
  );
}
