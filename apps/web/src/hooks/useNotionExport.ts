"use client";

import { useState } from "react";
import type { SavedMemo } from "@thoroughloop/core";
import type { NotionExportResult, NotionErrorBody } from "@/lib/notion";

export type NotionExportStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; pageId: string; url: string }
  | { kind: "error"; message: string };

export function useNotionExport() {
  const [status, setStatus] = useState<NotionExportStatus>({ kind: "idle" });

  async function exportToNotion(memo: SavedMemo): Promise<void> {
    setStatus({ kind: "loading" });

    try {
      const response = await fetch("/api/notion-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memo })
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as Partial<NotionErrorBody>;
        setStatus({
          kind: "error",
          message: body.message ?? `Export failed (HTTP ${response.status})`
        });
        return;
      }

      const data = (await response.json()) as NotionExportResult;
      setStatus({ kind: "success", pageId: data.pageId, url: data.url });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Network error"
      });
    }
  }

  function reset() {
    setStatus({ kind: "idle" });
  }

  return { status, exportToNotion, reset };
}
