"use client";

import { useEffect, useMemo, useRef, useState, type ButtonHTMLAttributes, type ReactNode, type RefObject } from "react";
import {
  DEFAULT_SETTINGS,
  DEFAULT_CONTEXT_SOURCE_ID,
  CONTEXT_SOURCE_OPTIONS,
  STORAGE_KEYS,
  appendCollectionItem,
  contextSourceForId,
  contextSourceLabelForId,
  createDiagnosis,
  formatDisplayDate,
  formatMemoForCopy,
  generateFounderMemo,
  memoToDecision,
  memoToFounderAction,
  readCollection,
  readJson,
  type ContextSourceId,
  type FounderDiagnosis,
  type SavedMemo,
  type Settings
} from "@thoroughloop/core";
import { webLocalStorageAdapter } from "@/storage/webLocalStorageAdapter";
import { useNotionExport } from "@/hooks/useNotionExport";

type LoopStage = "landing" | "compose" | "thinking" | "result";

type SampleLoop = {
  id: string;
  label: string;
  sourceId: ContextSourceId;
  situation: string;
  preview: string;
  context: string;
};

type ResultCopy = {
  diagnosis: string;
  tldr: string;
  why: string[];
  evidence: string[];
  missing: string[];
  action: {
    command: string;
    why: string;
    doneWhen: string;
  };
  decision: {
    question: string;
    whatToBring: string;
    whatToChoose: string;
  };
  investorSummary: string;
};

const THINKING_DELAY_MS = 350;

const samples: SampleLoop[] = [
  {
    id: "stalled-pipeline",
    label: "Stalled pipeline",
    sourceId: "crm_pipeline",
    situation: "Late-stage deals are stuck after pricing conversations.",
    preview: "FinCore is still circling pricing. BrightLayer ghosted after proposal. I keep adding leads but nothing is closing.",
    context:
      "FinCore Labs is stuck in negotiation after a pricing concern. BrightLayer AI has not replied after proposal for 12 days. Northstar Ops completed demo but is waiting for internal review. I keep adding new leads, but the late-stage pipeline feels soft. Discovery may be too shallow because buyers cannot repeat the business case back clearly."
  },
  {
    id: "onboarding-handoff",
    label: "Team meeting minutes",
    sourceId: "meeting_notes",
    situation: "A team meeting produced actions, blockers, and decisions, but no clear owner or review loop.",
    preview: "Growth wants more leads, product says onboarding is leaking, and no one owns the review decision.",
    context:
      "Growth meeting notes: paid campaigns are producing leads, but sales says quality is mixed. Product says onboarding drop-off is still high. Customer success says handoffs are unclear after the first call. The founder asked for one owner, but no one closed the loop. Need to decide whether to fix onboarding first or keep scaling acquisition."
  },
  {
    id: "hiring-confusion",
    label: "Hiring confusion",
    sourceId: "hiring_followup",
    situation: "The hiring loop has candidates, but no clear decision owner.",
    preview: "Two strong candidates, three different opinions, and the role keeps changing every interview.",
    context:
      "Hiring for the founding account executive role is stuck after candidate interviews. Two candidates are still active, the recruiter wants more pipeline, the sales lead wants a different profile, and the founder is not sure whether the role should be closer or pipeline builder. Offer timing is slipping."
  },
  {
    id: "product-feedback-overload",
    label: "Product feedback overload",
    sourceId: "customer_feedback",
    situation: "Customer calls created more ideas than operating clarity.",
    preview: "Everyone heard something different. Roadmap, retention, and onboarding requests are now all fighting for the same week.",
    context:
      "Customers gave scattered product feedback across calls. One asked for admin controls, one asked for cleaner onboarding, one complained about reporting, and the roadmap now has too many possible bets. The team cannot tell whether the bottleneck is activation, retention, or sales enablement."
  },
  {
    id: "investor-update-chaos",
    label: "Investor update chaos",
    sourceId: "general_notes",
    situation: "The update has progress, risk, and asks mixed together.",
    preview: "We have wins, churn risk, runway notes, and hiring asks, but the investor story reads like a raw dump.",
    context:
      "The investor update needs board-ready metrics, runway notes, growth progress, churn risk, hiring asks, and one clear fundraising ask. The raw notes include wins, unresolved risks, and too many tactical details. The founder needs an investor-safe narrative without oversharing internal mess."
  },
  {
    id: "requirements-handoff",
    label: "Requirements handoff",
    sourceId: "requirements_handoff",
    situation: "Requirements are changing before the team can execute.",
    preview: "Sales, product, and engineering are each seeing a different version of the onboarding ask.",
    context:
      "User feedback is spread across two calls, a Slack thread, and a product note. Sales says customers keep asking for faster onboarding, product says the request is too vague, and engineering says requirements keep changing after handoff. Nobody owns the clarification loop, so the same questions come back each sprint."
  },
  {
    id: "founder-workflow-chaos",
    label: "Founder workflow chaos",
    sourceId: "general_notes",
    situation: "Sales, hiring, and customer issues are moving at once.",
    preview: "One sales follow-up, one hiring decision, and one customer escalation are competing for founder attention.",
    context:
      "Three active priorities are moving at once: one sales follow-up, one hiring decision, and one customer escalation. Updates are scattered across notes and chat messages. I know something is slipping, but I cannot tell whether the bottleneck is ownership, decision delay, or lack of follow-up rhythm."
  }
];

const sampleById = new Map(samples.map((sample) => [sample.id, sample]));

function formatReviewDate(value: string): string {
  if (!value) {
    return "Not set";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(date);
}

function formatReviewDateLong(value: string): string {
  if (!value) {
    return "Not set";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function reviewDateFromCreatedAt(createdAt: string): string {
  const created = new Date(createdAt);

  if (Number.isNaN(created.getTime())) {
    return "";
  }

  const review = new Date(created);
  review.setDate(review.getDate() + 7);

  return review.toISOString().slice(0, 10);
}

function subjectFromDiagnosis(diagnosis: FounderDiagnosis): string {
  return diagnosis.extractedCompaniesOrDeals[0] ?? "this loop";
}

function resultCopyForWorkflow(
  diagnosis: FounderDiagnosis,
  selectedSampleId: string | null
): ResultCopy {
  const workflow = diagnosis.workflow.name;
  const subject = subjectFromDiagnosis(diagnosis);
  const riskSignals = diagnosis.extractedRiskSignals.filter((signal) => !signal.toLowerCase().includes("too thin"));
  const companies = diagnosis.extractedCompaniesOrDeals.length
    ? `Named context: ${diagnosis.extractedCompaniesOrDeals.join(", ")}.`
    : "No named company, deal, role, or project was clearly detected.";
  const keywords = diagnosis.matchedKeywords.length
    ? `Operating signals: ${diagnosis.matchedKeywords.slice(0, 5).join(", ")}.`
    : "The notes were too thin to produce strong operating signals.";
  const evidence = [...riskSignals.slice(0, 3), companies, keywords].slice(0, 4);
  const missing = diagnosis.missingContext.slice(0, 4);
  const common = {
    evidence,
    missing
  };

  if (workflow === "Revenue Rescue") {
    return {
      ...common,
      investorSummary:
        "The current revenue risk is not a pure pricing issue. The founder should verify buyer language in the next two discovery calls, then decide next week whether to keep the account in founder-led discovery or change the sales motion.",
      diagnosis: "The bottleneck is discovery quality, not pricing.",
      tldr: "Discovery quality, not pricing.",
      why: [
        "The notes show pricing friction after proposal, which usually means the buyer cannot defend the business case yet.",
        "More top-of-funnel work will not fix late-stage deals that cannot explain why now.",
        "The founder needs direct buyer language before changing price, packaging, or volume."
      ],
      action: {
        command: "Sit in on the next two discovery calls and write down the buyer's exact words.",
        why: "Do not pitch. Listen for the pain, business trigger, decision owner, and the phrase the buyer would use internally.",
        doneWhen: "Two call notes are written, each with the buyer's words and the next decision step."
      },
      decision: {
        question: `Should ${subject} stay in founder-led discovery before more selling effort is added?`,
        whatToBring: "Buyer language, pricing objection, decision owner, and next step.",
        whatToChoose: "Keep founder-led discovery, change the sales motion, or park the account."
      }
    };
  }

  if (workflow === "Onboarding Risk") {
    return {
      ...common,
      investorSummary:
        "The current onboarding risk is a handoff problem after the sale. The founder should force one owner, one blocker, and one dated activation milestone before the customer loses more momentum.",
      diagnosis: "The bottleneck is handoff clarity after the sale.",
      tldr: "Handoff clarity before more customer nudges.",
      why: [
        "The customer is closed, but ownership and activation criteria are still unclear.",
        "Repeated status calls are replacing a single next milestone.",
        "Founder attention should remove ambiguity, not become the standing project manager."
      ],
      action: {
        command: "Run a 20-minute handoff reset with the sales and onboarding owners.",
        why: "Force the blocker, owner, next milestone, and activation date into one shared view.",
        doneWhen: "One owner and one dated activation milestone are written down and sent to the customer."
      },
      decision: {
        question: `Does ${subject} need founder intervention before the next onboarding milestone?`,
        whatToBring: "Customer blocker, owner, promised outcome, and activation milestone.",
        whatToChoose: "Founder intervention, owner-led recovery, or deferred escalation."
      }
    };
  }

  if (workflow === "Hiring Bottleneck") {
    return {
      ...common,
      investorSummary:
        "The hiring loop has enough signal to make a decision. The founder should stabilize the role owner and next candidate step before adding more candidates to the pipeline.",
      diagnosis: "The bottleneck is decision ownership, not candidate volume.",
      tldr: "Decision ownership before more interviews.",
      why: [
        "The role definition is moving while candidates are already in process.",
        "More pipeline will add noise until the hiring decision criteria are stable.",
        "The founder needs to close one role decision before restarting sourcing."
      ],
      action: {
        command: "Name the decision owner and close the next candidate step by Friday.",
        why: "The hiring loop needs one accountable call on role shape, bar, and next step.",
        doneWhen: "The candidate is advanced, rejected, or paused with one written reason."
      },
      decision: {
        question: "Which hiring decision must be made before adding more candidates?",
        whatToBring: "Role definition, candidate evidence, decision owner, and tradeoff.",
        whatToChoose: "Advance, reject, pause, or rewrite the role."
      }
    };
  }

  if (workflow === "Investor Update") {
    return {
      ...common,
      investorSummary:
        "The investor update needs a clearer operating narrative. The founder should separate progress, risk, and the ask into one tight memo before sending more detail.",
      diagnosis: "The bottleneck is narrative discipline, not update volume.",
      tldr: "One clean risk narrative before more data.",
      why: [
        "Progress, risks, and asks are mixed together, which makes the update harder to trust.",
        "Investors need the operating judgment, not the whole internal debate.",
        "The founder should separate what changed, what is risky, and what help is needed."
      ],
      action: {
        command: "Draft one investor-safe update around progress, risk, and the ask.",
        why: "Keep the memo tight enough to show judgment without exposing unresolved internal noise.",
        doneWhen: "The update has one progress paragraph, one risk paragraph, and one explicit ask."
      },
      decision: {
        question: "What is the one investor narrative and ask for this period?",
        whatToBring: "Wins, risks, metrics, runway context, and the highest-leverage ask.",
        whatToChoose: "Send as-is, narrow the risk, change the ask, or hold the update."
      }
    };
  }

  if (selectedSampleId === "product-feedback-overload") {
    return {
      ...common,
      investorSummary:
        "Customer feedback is not the constraint; prioritization is. The founder should choose one product theme to test this week and keep the remaining requests out of the active operating loop.",
      diagnosis: "The bottleneck is prioritization, not customer feedback volume.",
      tldr: "One product bet before more input.",
      why: [
        "The notes contain multiple valid requests, but no ranked operating bet.",
        "Treating every request as equal will split design, sales, and onboarding focus.",
        "The founder needs one testable theme for the week."
      ],
      action: {
        command: "Choose one product feedback theme to test this week and park the rest.",
        why: "The team needs a single learning loop, not a bigger backlog.",
        doneWhen: "One theme, one owner, and one customer validation step are written down."
      },
      decision: {
        question: "Which product feedback theme deserves founder attention next week?",
        whatToBring: "Customer quotes, revenue impact, activation impact, and implementation cost.",
        whatToChoose: "Activate, sell better, retain current users, or defer."
      }
    };
  }

  return {
    ...common,
    investorSummary:
      "The current operating context is too scattered to support several parallel decisions. The founder should choose one focus for next week, assign one owner, and review one decision.",
    diagnosis: "The bottleneck is operating focus, not more context.",
    tldr: "One operating choice before more inputs.",
    why: [
      "The notes are mixed across progress, risk, and decisions.",
      "The founder needs one loop to close before adding another priority.",
      "The next week should test a decision, not collect more fragments."
    ],
    action: {
      command: "Choose one operating focus for next week and defer the rest.",
      why: "A single owner and decision loop will create more progress than a longer task list.",
      doneWhen: "The focus is written down with one owner, one metric, and one review date."
    },
    decision: {
      question: "What single operating decision gets founder attention next week?",
      whatToBring: "What moved, what got stuck, the metric, and the tradeoff.",
      whatToChoose: "Commit, defer, delegate, or stop."
    }
  };
}

function memoForResult(diagnosis: FounderDiagnosis, memo: SavedMemo, selectedSampleId: string | null): SavedMemo {
  const copy = resultCopyForWorkflow(diagnosis, selectedSampleId);

  return {
    ...memo,
    title: copy.tldr,
    diagnosis: copy.diagnosis,
    recommendedDecision: copy.decision.question,
    founderAction: copy.action.command,
    investorSafeSummary: copy.investorSummary
  };
}

function ButtonBase({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`rounded-md px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#d9a441]/30 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Section({
  title,
  children,
  muted = false
}: {
  title: string;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#101820] p-4 shadow-dark-soft sm:p-5">
      <h3 className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#d9a441]">
        {title}
      </h3>
      <div className={`mt-3 text-sm leading-6 ${muted ? "text-slate-400" : "text-slate-200"}`}>{children}</div>
    </section>
  );
}

function LandingHero({ onCompose }: { onCompose: () => void }) {
  return (
    <section className="grid gap-5 pt-8 sm:gap-6 sm:pt-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.58fr)] lg:items-end lg:gap-10 lg:pt-16">
      <div className="grid gap-4 sm:gap-5">
        <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#d9a441]">
          Founder operating diagnosis · local-first
        </p>
        <h1 className="max-w-4xl font-serif text-[2.55rem] font-semibold leading-[0.96] tracking-normal text-white sm:text-6xl lg:text-[5.6rem]">
          Paste messy founder context. Close the loop.
        </h1>
        <div className="order-3 sm:order-4">
          <ButtonBase
            onClick={onCompose}
            className="w-full bg-[#d9a441] text-[#071016] hover:bg-[#f0c76c] sm:w-auto"
          >
            Paste your context
          </ButtonBase>
        </div>
        <p className="order-4 max-w-3xl text-base leading-7 text-slate-300 sm:order-3 sm:text-xl sm:leading-8">
          Standup notes, customer calls, the argument at 11pm. Get back one diagnosis, one founder action for this week, and one decision to review next week.
        </p>
      </div>

      <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-slate-300 lg:mb-2">
        <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Trust caption
        </p>
        <p className="text-lg font-semibold text-white">No account. No upload. No tracking.</p>
      </div>
    </section>
  );
}

function InOutWhereStrip() {
  const items = [
    { label: "IN", value: "Messy notes" },
    { label: "OUT", value: "Memo, action, decision" },
    { label: "WHERE", value: "This browser only" }
  ];

  return (
    <section className="grid gap-2 sm:grid-cols-3 sm:gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-white/10 bg-[#101820] px-4 py-3">
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#d9a441]">
            {item.label}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-100 sm:text-base">{item.value}</p>
        </div>
      ))}
    </section>
  );
}

function SampleGrid({
  onUseSample
}: {
  onUseSample: (sample: SampleLoop) => void;
}) {
  return (
    <section className="grid gap-4" id="samples">
      <div className="grid gap-2">
        <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#d9a441]">
          Mess-forward samples
        </p>
        <h2 className="font-serif text-2xl font-semibold text-white sm:text-3xl">Start from real operating mess.</h2>
        <p className="text-sm leading-6 text-slate-500">Fictional examples for demo use. Paste your own context to run the loop.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {samples.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => onUseSample(sample)}
            className="group grid min-h-[190px] gap-4 rounded-lg border border-white/10 bg-[#111b23] p-4 text-left shadow-dark-soft transition hover:border-[#d9a441]/50 hover:bg-[#14232e] focus:outline-none focus:ring-2 focus:ring-[#d9a441]/30"
          >
            <div className="grid gap-2">
              <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#d9a441]">
                {sample.label}
              </p>
              <p className="text-sm font-semibold leading-5 text-white">{sample.situation}</p>
            </div>
            <p className="text-sm leading-6 text-slate-400">{sample.preview}</p>
            <span className="mt-auto inline-flex w-fit rounded-md border border-[#d9a441]/35 bg-[#d9a441]/10 px-3 py-2 text-sm font-semibold text-[#f0c76c]">
              Use this sample
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ExampleLoopCard() {
  return (
    <article className="rounded-lg border border-dashed border-white/15 bg-white/[0.025] p-4 opacity-75 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-[#d9a441]/30 bg-[#d9a441]/10 px-2 py-1 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#f0c76c]">
          Example
        </span>
        <span className="rounded-md border border-white/10 px-2 py-1 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Revenue Rescue
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-white">Discovery quality, not pricing.</h3>
      <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-400 md:grid-cols-2">
        <p>
          <span className="font-semibold text-slate-200">Founder action:</span> Sit in on the next two discovery calls and write down the buyer&apos;s exact words.
        </p>
        <p>
          <span className="font-semibold text-slate-200">Decision:</span> Should the founder stay in discovery before more selling effort is added?
        </p>
      </div>
    </article>
  );
}

function HistorySection({
  memos,
  onCopyMemo,
  copiedId,
  historyRef
}: {
  memos: SavedMemo[];
  onCopyMemo: (memo: SavedMemo) => void;
  copiedId: string;
  historyRef: RefObject<HTMLElement>;
}) {
  return (
    <section ref={historyRef} className="grid gap-4" id="saved-history">
      <div className="grid gap-2">
        <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#d9a441]">
          Review later
        </p>
        <h2 className="font-serif text-2xl font-semibold text-white sm:text-3xl">Saved loops</h2>
      </div>

      {memos.length ? (
        <div className="grid gap-3">
          {memos.map((memo) => {
            const reviewDate = reviewDateFromCreatedAt(memo.createdAt);
            const sourceLabel = contextSourceLabelForId(memo.contextSource);

            return (
              <article key={memo.id} className="rounded-lg border border-white/10 bg-[#101820] p-4 shadow-dark-soft sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md border border-white/10 px-2 py-1 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {memo.workflow}
                      </span>
                      <span className="rounded-md border border-white/10 px-2 py-1 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Source · {sourceLabel}
                      </span>
                      <span className="rounded-md border border-[#d9a441]/30 bg-[#d9a441]/10 px-2 py-1 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#f0c76c]">
                        Review · {formatReviewDate(reviewDate)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white sm:text-xl">{memo.title}</h3>
                  </div>
                  <ButtonBase
                    onClick={() => onCopyMemo(memo)}
                    className="border border-white/15 bg-white/5 text-white hover:border-[#d9a441]/40 hover:bg-white/10"
                  >
                    {copiedId === memo.id ? "Copied" : "Copy memo"}
                  </ButtonBase>
                </div>
                <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-400 md:grid-cols-2">
                  <p>
                    <span className="font-semibold text-slate-200">Founder action:</span> {memo.founderAction}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-200">Decision:</span> {memo.recommendedDecision}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-3">
          <div className="rounded-lg border border-white/10 bg-[#101820] p-4 text-sm leading-6 text-slate-400 sm:p-5">
            Saved loops will appear here after you save a diagnosis. This stays local to this browser.
          </div>
          <ExampleLoopCard />
        </div>
      )}
    </section>
  );
}

function Compose({
  rawInput,
  selectedSample,
  selectedSourceId,
  textareaRef,
  onChange,
  onSourceChange,
  onCloseLoop,
  onChangeSample
}: {
  rawInput: string;
  selectedSample: SampleLoop | null;
  selectedSourceId: ContextSourceId;
  textareaRef: RefObject<HTMLTextAreaElement>;
  onChange: (value: string) => void;
  onSourceChange: (value: ContextSourceId) => void;
  onCloseLoop: () => void;
  onChangeSample: () => void;
}) {
  const source = contextSourceForId(selectedSourceId);

  return (
    <section className="mx-auto grid max-w-3xl gap-4 px-4 pb-28 pt-8 sm:px-5 sm:pt-12 lg:pt-16">
      <div className="grid gap-2">
        <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#d9a441]">
          Step 1 · compose
        </p>
        <h1 className="font-serif text-3xl font-semibold leading-tight text-white sm:text-5xl">
          Paste the operating mess.
        </h1>
        <p className="text-sm leading-6 text-slate-400 sm:text-base">More context gives a sharper diagnosis.</p>
      </div>

      {selectedSample ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
          <span>
            Loaded: <span className="font-semibold text-white">{selectedSample.label}</span>
          </span>
          <span className="text-slate-500">Source: {source.label}</span>
          <button
            type="button"
            onClick={onChangeSample}
            className="font-semibold text-[#f0c76c] underline underline-offset-4"
          >
            change
          </button>
        </div>
      ) : null}

      <div className="grid gap-3 rounded-lg border border-white/10 bg-[#101820] p-4 shadow-dark-soft">
        <div className="grid gap-1">
          <label
            htmlFor="context-source"
            className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-400"
          >
            Where is this context coming from?
          </label>
          <p className="text-sm leading-6 text-slate-500">
            Manual import only. ThoroughLoop does not connect to external tools yet.
          </p>
        </div>
        <select
          id="context-source"
          data-testid="context-source-select"
          value={selectedSourceId}
          onChange={(event) => onSourceChange(event.target.value as ContextSourceId)}
          className="w-full rounded-md border border-white/10 bg-[#071016] px-3 py-2.5 text-sm font-semibold text-slate-100 outline-none transition focus:border-[#d9a441] focus:ring-2 focus:ring-[#d9a441]/20"
        >
          {CONTEXT_SOURCE_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-sm leading-6 text-slate-400">{source.helperText}</p>
      </div>

      <label className="grid gap-3">
        <span className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Founder context
        </span>
        <p className="text-sm leading-6 text-slate-500">
          Public demo note: use fictional or sanitized context. Avoid confidential production data.
        </p>
        <textarea
          ref={textareaRef}
          data-testid="messy-context-input"
          autoFocus
          value={rawInput}
          onChange={(event) => onChange(event.target.value)}
          rows={10}
          placeholder={source.placeholderText}
          className="min-h-[300px] rounded-lg border border-white/10 bg-[#101820] px-4 py-4 text-base leading-7 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-[#d9a441] focus:ring-2 focus:ring-[#d9a441]/20"
        />
      </label>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#071016]/95 px-4 py-3 backdrop-blur sm:sticky sm:bottom-4 sm:rounded-lg sm:border sm:bg-[#101820]/95">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">Short notes are fine. Empty notes stay closed.</p>
          <ButtonBase
            onClick={onCloseLoop}
            disabled={!rawInput.trim()}
            className="w-full bg-[#d9a441] text-[#071016] hover:bg-[#f0c76c] sm:w-auto"
          >
            Close the loop
          </ButtonBase>
        </div>
      </div>
    </section>
  );
}

function Thinking() {
  return (
    <section className="mx-auto flex min-h-[65vh] max-w-3xl items-center px-4 py-12 sm:px-5">
      <div className="grid gap-4 rounded-lg border border-white/10 bg-[#101820] p-6 shadow-dark-soft sm:p-8">
        <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#d9a441]">
          Thinking
        </p>
        <h1 className="font-serif text-3xl font-semibold text-white sm:text-5xl">Finding the actual bottleneck</h1>
        <p className="max-w-xl text-sm leading-6 text-slate-400">
          Separating the operating signal, evidence, missing context, action, and review decision.
        </p>
      </div>
    </section>
  );
}

function ActionDecisionPair({
  copy,
  reviewDate
}: {
  copy: ResultCopy;
  reviewDate: string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-lg border border-[#d9a441]/25 bg-[#181b16] p-4 shadow-dark-soft sm:p-5">
        <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#d9a441]">
          This week&apos;s action
        </p>
        <h3 className="mt-3 text-xl font-semibold leading-7 text-white">{copy.action.command}</h3>
        <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-300">
          <p>
            <span className="font-semibold text-white">Why:</span> {copy.action.why}
          </p>
          <p>
            <span className="font-semibold text-white">Done when:</span> {copy.action.doneWhen}
          </p>
        </div>
      </article>

      <article className="rounded-lg border border-white/10 bg-[#101820] p-4 shadow-dark-soft sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#d9a441]">
            Decision to review next week
          </p>
          <span className="rounded-md border border-[#d9a441]/30 bg-[#d9a441]/10 px-2.5 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#f0c76c]">
            Review · {formatReviewDate(reviewDate)}
          </span>
        </div>
        <h3 className="mt-3 text-xl font-semibold leading-7 text-white">{copy.decision.question}</h3>
        <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-300">
          <p>
            <span className="font-semibold text-white">What to bring:</span> {copy.decision.whatToBring}
          </p>
          <p>
            <span className="font-semibold text-white">What to choose:</span> {copy.decision.whatToChoose}
          </p>
          <p>
            <span className="font-semibold text-white">Review date:</span> {formatReviewDateLong(reviewDate)}
          </p>
        </div>
      </article>
    </div>
  );
}

function ShortDiagnosis({ copy }: { copy: ResultCopy }) {
  return (
    <section data-testid="short-diagnosis" className="rounded-lg border border-white/10 bg-[#101820] p-4 shadow-dark-soft sm:p-5">
      <p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#d9a441]">
        Short diagnosis
      </p>
      <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight text-white sm:text-3xl">{copy.diagnosis}</h2>
      <p className="mt-4 rounded-lg border border-[#d9a441]/25 bg-[#d9a441]/10 px-4 py-3 text-sm font-semibold text-[#f0c76c]">
        TL;DR: {copy.tldr}
      </p>
    </section>
  );
}

function SupportingContext({ copy }: { copy: ResultCopy }) {
  return (
    <details
      data-testid="supporting-context"
      className="group rounded-lg border border-white/10 bg-[#101820] p-4 text-slate-300 shadow-dark-soft sm:p-5"
    >
      <summary className="cursor-pointer list-none font-mono text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#d9a441] marker:hidden">
        <span className="inline-flex items-center gap-2">
          Supporting context
          <span className="font-sans text-xs normal-case tracking-normal text-slate-500 group-open:hidden">Show details</span>
          <span className="hidden font-sans text-xs normal-case tracking-normal text-slate-500 group-open:inline">Hide details</span>
        </span>
      </summary>
      <div className="mt-4 grid gap-4">
        <Section title="Why this is the bottleneck">
          <ul className="grid gap-2">
            {copy.why.map((item) => (
              <li key={item} className="pl-4 before:-ml-4 before:mr-2 before:text-[#d9a441] before:content-['-']">
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Evidence from your notes">
          <ul className="grid gap-2">
            {copy.evidence.map((item) => (
              <li key={item} className="pl-4 before:-ml-4 before:mr-2 before:text-[#d9a441] before:content-['-']">
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Missing context" muted>
          <ul className="grid gap-2">
            {copy.missing.map((item) => (
              <li key={item} className="pl-4 before:-ml-4 before:mr-2 before:text-slate-600 before:content-['-']">
                {item}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </details>
  );
}

type NotionExportState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; url: string }
  | { kind: "error"; message: string };

function Result({
  diagnosis,
  memo,
  selectedSampleId,
  copied,
  saved,
  notionState,
  onStartNew,
  onCopyMemo,
  onSaveLoop,
  onExportToNotion
}: {
  diagnosis: FounderDiagnosis;
  memo: SavedMemo;
  selectedSampleId: string | null;
  copied: boolean;
  saved: boolean;
  notionState: NotionExportState;
  onStartNew: () => void;
  onCopyMemo: () => void;
  onSaveLoop: () => void;
  onExportToNotion: () => void;
}) {
  const copy = useMemo(() => resultCopyForWorkflow(diagnosis, selectedSampleId), [diagnosis, selectedSampleId]);
  const reviewDate = memoToDecision(memo).reviewDate;
  const sourceLabel = contextSourceLabelForId(memo.contextSource ?? diagnosis.contextSource);

  return (
    <section className="mx-auto grid max-w-4xl gap-4 px-4 pb-32 pt-8 sm:px-5 sm:pt-12 lg:pt-16">
      <header className="rounded-lg border border-white/10 bg-[#101820] p-4 shadow-dark-soft sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-white/10 px-2 py-1 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {diagnosis.workflow.name}
          </span>
          <span className="rounded-md border border-white/10 px-2 py-1 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {formatDisplayDate(diagnosis.createdAt)}
          </span>
          <span className="rounded-md border border-white/10 px-2 py-1 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Source · {sourceLabel}
          </span>
        </div>
        <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-white sm:text-4xl">
          This week&apos;s action and next review
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
          Start with the action and review decision. Supporting diagnosis details sit below.
        </p>
      </header>

      <div data-testid="primary-action-review">
        <ActionDecisionPair copy={copy} reviewDate={reviewDate} />
      </div>

      <ShortDiagnosis copy={copy} />

      <SupportingContext copy={copy} />

      <Section title="Investor-safe summary">
        <p>{copy.investorSummary}</p>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#071016]/95 px-4 py-3 backdrop-blur lg:sticky lg:bottom-4 lg:rounded-lg lg:border lg:bg-[#101820]/95">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <ButtonBase
            onClick={onStartNew}
            className="border border-white/15 bg-white/5 text-white hover:border-[#d9a441]/40 hover:bg-white/10"
          >
            Start new loop
          </ButtonBase>
          <ButtonBase
            onClick={onCopyMemo}
            className="border border-white/15 bg-white/5 text-white hover:border-[#d9a441]/40 hover:bg-white/10"
          >
            {copied ? "Memo copied" : "Copy memo"}
          </ButtonBase>
          <ButtonBase
            onClick={onSaveLoop}
            disabled={saved}
            className="bg-[#d9a441] text-[#071016] hover:bg-[#f0c76c]"
          >
            {saved ? "Loop saved" : "Save loop"}
          </ButtonBase>
          <ButtonBase
            data-testid="export-to-notion"
            onClick={onExportToNotion}
            disabled={notionState.kind === "loading" || notionState.kind === "success"}
            className="border border-white/15 bg-white/5 text-white hover:border-[#d9a441]/40 hover:bg-white/10"
          >
            {notionState.kind === "loading"
              ? "Exporting…"
              : notionState.kind === "success"
                ? "Exported ✓"
                : "Export to Notion"}
          </ButtonBase>
        </div>
        {notionState.kind === "success" ? (
          <p className="mx-auto mt-2 max-w-4xl text-xs text-[#f0c76c]">
            Exported to Notion.{" "}
            <a href={notionState.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              Open page
            </a>
          </p>
        ) : null}
        {notionState.kind === "error" ? (
          <p className="mx-auto mt-2 max-w-4xl text-xs text-red-400">{notionState.message}</p>
        ) : null}
      </div>
    </section>
  );
}

export function HomeLoop() {
  const [stage, setStage] = useState<LoopStage>("landing");
  const [rawInput, setRawInput] = useState("");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [diagnosis, setDiagnosis] = useState<FounderDiagnosis | null>(null);
  const [memo, setMemo] = useState<SavedMemo | null>(null);
  const [savedMemos, setSavedMemos] = useState<SavedMemo[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<ContextSourceId>(DEFAULT_CONTEXT_SOURCE_ID);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [copiedHistoryMemoId, setCopiedHistoryMemoId] = useState("");
  const [savedCurrentLoop, setSavedCurrentLoop] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sampleSectionRef = useRef<HTMLElement>(null);
  const historySectionRef = useRef<HTMLElement>(null);
  const selectedSample = selectedSampleId ? sampleById.get(selectedSampleId) ?? null : null;
  const { status: notionStatus, exportToNotion, reset: resetNotion } = useNotionExport();

  useEffect(() => {
    void readJson<Settings>(webLocalStorageAdapter, STORAGE_KEYS.settings, DEFAULT_SETTINGS).then(setSettings);
    void readCollection<SavedMemo>(webLocalStorageAdapter, STORAGE_KEYS.memos).then(setSavedMemos);
  }, []);

  useEffect(() => {
    if (stage !== "compose") {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      textareaRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "thinking") {
      return;
    }

    const thinkingTimer = window.setTimeout(() => {
      const nextDiagnosis = createDiagnosis(rawInput, undefined, selectedSourceId);
      const generatedMemo = generateFounderMemo(nextDiagnosis, settings);
      const nextMemo = memoForResult(nextDiagnosis, generatedMemo, selectedSampleId);

      setDiagnosis(nextDiagnosis);
      setMemo(nextMemo);
      setCopiedMemo(false);
      setSavedCurrentLoop(false);
      setStage("result");
    }, THINKING_DELAY_MS);

    return () => window.clearTimeout(thinkingTimer);
  }, [rawInput, selectedSampleId, selectedSourceId, settings, stage]);

  function openCompose() {
    setRawInput("");
    setSelectedSampleId(null);
    setSelectedSourceId(DEFAULT_CONTEXT_SOURCE_ID);
    setStage("compose");
  }

  function useSample(sample: SampleLoop) {
    setSelectedSampleId(sample.id);
    setSelectedSourceId(sample.sourceId);
    setRawInput(sample.context);
    setStage("compose");
  }

  function changeSample() {
    setStage("landing");
    window.requestAnimationFrame(() => {
      sampleSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function closeLoop() {
    if (!rawInput.trim()) {
      return;
    }

    setStage("thinking");
  }

  async function copyCurrentMemo() {
    if (!memo) {
      return;
    }

    await navigator.clipboard.writeText(formatMemoForCopy(memo));
    setCopiedMemo(true);
  }

  async function copyHistoryMemo(item: SavedMemo) {
    await navigator.clipboard.writeText(formatMemoForCopy(item));
    setCopiedHistoryMemoId(item.id);
  }

  async function saveLoop() {
    if (!memo) {
      return;
    }

    const nextMemos = await appendCollectionItem(webLocalStorageAdapter, STORAGE_KEYS.memos, memo);
    await appendCollectionItem(webLocalStorageAdapter, STORAGE_KEYS.actions, memoToFounderAction(memo));
    await appendCollectionItem(webLocalStorageAdapter, STORAGE_KEYS.decisions, memoToDecision(memo));
    setSavedMemos(nextMemos);
    setSavedCurrentLoop(true);
  }

  async function exportCurrentMemoToNotion() {
    if (!memo) {
      return;
    }

    await exportToNotion(memo);
  }

  function startNewLoop() {
    setRawInput("");
    setSelectedSampleId(null);
    setSelectedSourceId(DEFAULT_CONTEXT_SOURCE_ID);
    setDiagnosis(null);
    setMemo(null);
    setCopiedMemo(false);
    setSavedCurrentLoop(false);
    resetNotion();
    setStage("landing");
    window.requestAnimationFrame(() => {
      historySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (stage === "compose") {
    return (
      <Compose
        rawInput={rawInput}
        selectedSample={selectedSample}
        selectedSourceId={selectedSourceId}
        textareaRef={textareaRef}
        onChange={setRawInput}
        onSourceChange={setSelectedSourceId}
        onCloseLoop={closeLoop}
        onChangeSample={changeSample}
      />
    );
  }

  if (stage === "thinking") {
    return <Thinking />;
  }

  if (stage === "result" && diagnosis && memo) {
    return (
      <Result
        diagnosis={diagnosis}
        memo={memo}
        selectedSampleId={selectedSampleId}
        copied={copiedMemo}
        saved={savedCurrentLoop}
        notionState={notionStatus}
        onStartNew={startNewLoop}
        onCopyMemo={copyCurrentMemo}
        onSaveLoop={saveLoop}
        onExportToNotion={exportCurrentMemoToNotion}
      />
    );
  }

  return (
    <div className="bg-[#071016] text-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-12 sm:gap-8 sm:px-5 sm:pb-16 lg:gap-10 lg:px-8">
        <LandingHero onCompose={openCompose} />
        <InOutWhereStrip />
        <section ref={sampleSectionRef}>
          <SampleGrid onUseSample={useSample} />
        </section>
        <HistorySection
          memos={savedMemos}
          onCopyMemo={copyHistoryMemo}
          copiedId={copiedHistoryMemoId}
          historyRef={historySectionRef}
        />
      </div>
    </div>
  );
}
