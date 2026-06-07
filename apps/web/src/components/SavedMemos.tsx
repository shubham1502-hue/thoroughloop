"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  STORAGE_KEYS,
  WORKFLOWS,
  contextSourceLabelForId,
  formatDisplayDate,
  formatMemoForCopy,
  readCollection,
  removeCollectionItem,
  type SavedMemo,
  type WorkflowName
} from "@thoroughloop/core";
import { webLocalStorageAdapter } from "@/storage/webLocalStorageAdapter";

export function SavedMemos() {
  const [memos, setMemos] = useState<SavedMemo[]>([]);
  const [search, setSearch] = useState("");
  const [workflow, setWorkflow] = useState<WorkflowName | "All">("All");

  useEffect(() => {
    void readCollection<SavedMemo>(webLocalStorageAdapter, STORAGE_KEYS.memos).then(setMemos);
  }, []);

  const filteredMemos = useMemo(() => {
    const query = search.trim().toLowerCase();

    return memos.filter((memo) => {
      const matchesWorkflow = workflow === "All" || memo.workflow === workflow;
      const matchesSearch =
        !query ||
        [
          memo.title,
          memo.problem,
          memo.recommendedDecision,
          memo.founderAction,
          memo.investorSafeSummary,
          contextSourceLabelForId(memo.contextSource)
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesWorkflow && matchesSearch;
    });
  }, [memos, search, workflow]);

  async function deleteMemo(id: string) {
    const nextMemos = await removeCollectionItem<SavedMemo>(webLocalStorageAdapter, STORAGE_KEYS.memos, id);
    setMemos(nextMemos);
  }

  async function copyMemo(memo: SavedMemo) {
    await navigator.clipboard.writeText(formatMemoForCopy(memo));
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-5 md:gap-6 md:px-8 md:py-10">
      <div className="grid gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Memos</p>
        <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">Saved founder memos</h1>
      </div>

      <div className="grid gap-3 rounded-lg border border-line bg-white p-3 sm:p-4 md:grid-cols-[1fr_260px]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search memos"
          className="rounded-md border border-line bg-paper px-3 py-2 outline-none focus:border-forest focus:ring-2 focus:ring-forest/15"
        />
        <select
          value={workflow}
          onChange={(event) => setWorkflow(event.target.value as WorkflowName | "All")}
          className="rounded-md border border-line bg-paper px-3 py-2 outline-none focus:border-forest focus:ring-2 focus:ring-forest/15"
        >
          <option value="All">All workflows</option>
          {WORKFLOWS.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {filteredMemos.length ? (
        <div className="grid gap-4">
          {filteredMemos.map((memo) => (
            <article key={memo.id} className="rounded-lg border border-line bg-white p-4 shadow-soft sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold sm:text-2xl">{memo.title}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {memo.workflow} | Source: {contextSourceLabelForId(memo.contextSource)} | {formatDisplayDate(memo.createdAt)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <button type="button" onClick={() => copyMemo(memo)} className="rounded-md border border-line px-3 py-2 text-sm font-semibold">
                    Copy memo
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteMemo(memo.id)}
                    className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-[#8f2f2f]"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold">Problem</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{memo.problem}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Recommended decision</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{memo.recommendedDecision}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Founder action</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{memo.founderAction}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Investor-safe summary</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{memo.investorSafeSummary}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : memos.length ? (
        <div className="grid gap-3 rounded-lg border border-line bg-white p-6 text-muted">
          <p className="font-semibold text-ink">No memos match the current filters.</p>
          <p>This page stores saved founder memos from completed diagnoses. Clear the search or workflow filter to review the saved memo library.</p>
        </div>
      ) : (
        <div className="grid gap-3 rounded-lg border border-line bg-white p-6 text-muted">
          <p className="font-semibold text-ink">No memos saved yet.</p>
          <p>This page stores founder memos after a diagnosis is generated. It is empty because no memo has been saved on this device yet.</p>
          <p>
            Start with a messy diagnosis from the{" "}
            <Link href="/" className="font-semibold text-forest underline underline-offset-4">
              homepage
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
