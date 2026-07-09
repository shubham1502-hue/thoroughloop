import type { FounderDiagnosis, SourceSnippet } from "./types";
import { uniqueValues } from "./validation";

const MAX_SOURCE_SNIPPETS = 4;
const MIN_SOURCE_LENGTH = 35;
const FALLBACK_SOURCE_SNIPPET =
  "No strong source snippet found. Add more concrete notes before trusting this task.";

const reasonRules: Array<{ terms: string[]; reason: string }> = [
  {
    terms: ["pricing", "price", "discount"],
    reason: "Mentions pricing concern"
  },
  {
    terms: ["no reply", "not replied", "follow-up", "follow up", "proposal", "ghosted"],
    reason: "Mentions stale proposal follow-up"
  },
  {
    terms: ["owner", "unassigned", "nobody owns", "unclear owner", "no one owns"],
    reason: "Mentions unclear owner"
  },
  {
    terms: ["onboarding", "activation", "blocker", "blocked", "handoff"],
    reason: "Mentions onboarding blocker"
  },
  {
    terms: ["hiring", "candidate", "interview", "offer", "role"],
    reason: "Mentions hiring decision delay"
  },
  {
    terms: ["decision", "decide", "review", "choose", "next friday", "next week"],
    reason: "Mentions decision review need"
  }
];

function fallbackSnippet(): SourceSnippet {
  return {
    id: "source_1",
    text: FALLBACK_SOURCE_SNIPPET,
    reason: "Needs more concrete source context"
  };
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function splitSourceChunks(rawInput: string): string[] {
  const lineChunks = rawInput
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+/))
    .map(normalizeWhitespace)
    .filter(Boolean);

  return uniqueValues(lineChunks).filter((chunk) => chunk.length >= 12);
}

function includesAny(lowerChunk: string, terms: string[]): boolean {
  return terms.some((term) => lowerChunk.includes(term.toLowerCase()));
}

function reasonForChunk(diagnosis: FounderDiagnosis, chunk: string): string {
  const lowerChunk = chunk.toLowerCase();
  const matchedRule = reasonRules.find((rule) => includesAny(lowerChunk, rule.terms));

  if (matchedRule) {
    return matchedRule.reason;
  }

  if (diagnosis.extractedCompaniesOrDeals.some((name) => lowerChunk.includes(name.toLowerCase()))) {
    return "Mentions named operating context";
  }

  if (diagnosis.matchedKeywords.some((keyword) => lowerChunk.includes(keyword.toLowerCase()))) {
    return "Matches workflow signal";
  }

  return "Supports the detected operating bottleneck";
}

function scoreChunk(diagnosis: FounderDiagnosis, chunk: string): number {
  const lowerChunk = chunk.toLowerCase();
  let score = 0;

  for (const keyword of diagnosis.matchedKeywords) {
    if (lowerChunk.includes(keyword.toLowerCase())) {
      score += 3;
    }
  }

  for (const name of diagnosis.extractedCompaniesOrDeals) {
    if (lowerChunk.includes(name.toLowerCase())) {
      score += 2;
    }
  }

  for (const rule of reasonRules) {
    if (includesAny(lowerChunk, rule.terms)) {
      score += 4;
    }
  }

  if (chunk.length >= 50) {
    score += 1;
  }

  return score;
}

export function extractSourceSnippets(diagnosis: FounderDiagnosis): SourceSnippet[] {
  const rawInput = diagnosis.rawInput.trim();

  if (rawInput.length < MIN_SOURCE_LENGTH) {
    return [fallbackSnippet()];
  }

  const ranked = splitSourceChunks(rawInput)
    .map((chunk, index) => ({
      chunk,
      index,
      score: scoreChunk(diagnosis, chunk)
    }))
    .filter((item) => item.score >= 3)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, MAX_SOURCE_SNIPPETS)
    .sort((a, b) => a.index - b.index);

  if (!ranked.length) {
    return [fallbackSnippet()];
  }

  return ranked.map((item, index) => ({
    id: `source_${index + 1}`,
    text: item.chunk,
    reason: reasonForChunk(diagnosis, item.chunk)
  }));
}
