export const DEFAULT_CONTEXT_SOURCE_ID = "general_notes";

export const CONTEXT_SOURCE_OPTIONS = [
  {
    id: "general_notes",
    label: "General founder notes",
    helperText: "Paste any messy founder or operator context.",
    placeholderText:
      "Paste standup notes, call notes, investor draft fragments, hiring debate, customer blockers, or anything else that feels messy."
  },
  {
    id: "slack",
    label: "Slack thread or channel notes",
    helperText: "Paste the relevant Slack messages or thread summary.",
    placeholderText: "Paste Slack messages, thread summaries, decisions, open questions, or follow-up notes."
  },
  {
    id: "notion",
    label: "Notion page or workspace notes",
    helperText: "Paste the relevant Notion notes, decisions, or project context.",
    placeholderText: "Paste Notion notes, project context, decisions, blockers, or unresolved follow-ups."
  },
  {
    id: "crm_pipeline",
    label: "CRM or sales pipeline notes",
    helperText: "Paste deal notes, follow-ups, blockers, or pipeline updates.",
    placeholderText: "Paste deal notes, pipeline updates, sales follow-ups, pricing blockers, or next steps."
  },
  {
    id: "customer_feedback",
    label: "Customer feedback",
    helperText: "Paste feedback snippets, themes, complaints, or requests.",
    placeholderText: "Paste customer feedback snippets, complaints, feature requests, or support themes."
  },
  {
    id: "meeting_notes",
    label: "Meeting minutes or call notes",
    helperText:
      "Paste meeting minutes, call notes, or transcript-style notes. ThoroughLoop will look for actions, decisions, blockers, owners, and follow-up points.",
    placeholderText:
      "Paste meeting minutes, call notes, decisions, blockers, owners, open questions, follow-ups, or next-review points."
  },
  {
    id: "requirements_handoff",
    label: "Product requirements or handoff notes",
    helperText: "Paste messy requirements, open questions, or handoff context.",
    placeholderText: "Paste messy requirements, handoff notes, changing scope, open questions, or owner confusion."
  },
  {
    id: "hiring_followup",
    label: "Hiring follow-up notes",
    helperText: "Paste candidate, role, interview, or follow-up context.",
    placeholderText: "Paste candidate notes, role debate, interview feedback, follow-ups, or offer timing concerns."
  },
  {
    id: "other",
    label: "Other",
    helperText: "Paste any messy founder or operator context.",
    placeholderText: "Paste any messy founder or operator context that needs one diagnosis, action, and decision."
  }
] as const;

export type ContextSourceId = (typeof CONTEXT_SOURCE_OPTIONS)[number]["id"];

export interface ContextSourceOption {
  id: ContextSourceId;
  label: string;
  helperText: string;
  placeholderText?: string;
}

export function isContextSourceId(value: unknown): value is ContextSourceId {
  return (
    typeof value === "string" &&
    CONTEXT_SOURCE_OPTIONS.some((source) => source.id === value)
  );
}

export function normalizeContextSourceId(value: unknown): ContextSourceId {
  return isContextSourceId(value) ? value : DEFAULT_CONTEXT_SOURCE_ID;
}

export function contextSourceForId(value: unknown): ContextSourceOption {
  const id = normalizeContextSourceId(value);
  return CONTEXT_SOURCE_OPTIONS.find((source) => source.id === id) ?? CONTEXT_SOURCE_OPTIONS[0];
}

export function contextSourceLabelForId(value: unknown): string {
  return contextSourceForId(value).label;
}
