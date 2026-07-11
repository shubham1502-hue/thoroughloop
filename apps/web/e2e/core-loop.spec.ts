import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const messyFounderContext =
  "FinCore Labs has been stuck in negotiation for 21 days after a pricing concern. BrightLayer AI has no reply after proposal for 12 days. Northstar Ops completed demo but is waiting for review. Founder follow-up is slipping and proposal-stage deals need attention this week.";

async function expectSectionOrder(page: Page, firstTestId: string, secondTestId: string) {
  const order = await page.evaluate(
    ({ firstTestId, secondTestId }) => {
      const first = document.querySelector(`[data-testid="${firstTestId}"]`);
      const second = document.querySelector(`[data-testid="${secondTestId}"]`);

      if (!first || !second) {
        return false;
      }

      return Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);
    },
    { firstTestId, secondTestId }
  );

  expect(order).toBe(true);
}

async function expectReadableContrast(locator: Locator) {
  const result = await locator.evaluate((element) => {
    function channels(value: string): [number, number, number, number] {
      const parts = value.match(/[\d.]+/g)?.map(Number) ?? [];
      return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts[3] ?? 1];
    }

    function luminance([red, green, blue]: [number, number, number, number]): number {
      const values = [red, green, blue].map((value) => {
        const channel = value / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
    }

    const foreground = getComputedStyle(element).color;
    let backgroundElement: Element | null = element;
    let background = "rgba(0, 0, 0, 0)";

    while (backgroundElement) {
      background = getComputedStyle(backgroundElement).backgroundColor;
      if (channels(background)[3] > 0) {
        break;
      }
      backgroundElement = backgroundElement.parentElement;
    }

    const foregroundLuminance = luminance(channels(foreground));
    const backgroundLuminance = luminance(channels(background));
    const ratio =
      (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
      (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);

    return { foreground, background, ratio };
  });

  expect(result.ratio, `${result.foreground} on ${result.background}`).toBeGreaterThanOrEqual(4.5);
}

test("founder can complete the ThoroughLoop browser loop", async ({ page }) => {
  await page.goto("/");
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: new URL(page.url()).origin
  });
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await expect(page.getByRole("heading", { name: "Choose the operating loop first." })).toBeVisible();
  for (const workflowName of [
    "Revenue Rescue",
    "Weekly Operating Review",
    "Investor Update",
    "Onboarding Risk",
    "Hiring Bottleneck"
  ]) {
    await expect(page.getByRole("heading", { name: workflowName })).toBeVisible();
  }
  await expect(page.getByText("Best input to paste").first()).toBeVisible();
  await expect(page.getByText("3 minutes")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Revenue Rescue workflow" })).toHaveAttribute(
    "href",
    "/workflows/revenue-rescue"
  );
  await expect(page.getByText("Sample operating messes")).toBeVisible();
  await expect(page.getByRole("button", { name: /Stalled pipeline/ })).toBeVisible();
  await expect(page.getByText("Demo surfaces")).toHaveCount(0);
  await expect(page.getByText("Explore ThoroughLoop")).toBeVisible();

  await page.getByRole("button", { name: "Paste your context" }).click();
  await expect(page.getByText("More context gives a sharper diagnosis.")).toBeVisible();
  await expect(page.getByLabel("Where is this context coming from?")).toHaveValue("general_notes");
  await page.getByLabel("Where is this context coming from?").selectOption("notion");
  await expect(page.getByText("Paste the relevant Notion notes, decisions, or project context.")).toBeVisible();
  await expect(page.getByText("Manual import only. ThoroughLoop does not connect to external tools yet.")).toBeVisible();
  await expect(page.getByText("Public demo note: use fictional or sanitized context. Avoid confidential production data.")).toBeVisible();
  await page.getByLabel("Where is this context coming from?").selectOption("meeting_notes");
  await expect(
    page.getByText(
      "Paste meeting minutes, call notes, or transcript-style notes. ThoroughLoop will look for actions, decisions, blockers, owners, and follow-up points."
    )
  ).toBeVisible();
  await expect(page.getByTestId("messy-context-input")).toHaveAttribute(
    "placeholder",
    "Paste meeting minutes, call notes, decisions, blockers, owners, open questions, follow-ups, or next-review points."
  );
  await page.getByTestId("context-source-select").selectOption("slack");
  await expect(page.getByText("Paste the relevant Slack messages or thread summary.")).toBeVisible();
  await page.getByTestId("messy-context-input").fill(messyFounderContext);
  await page.getByRole("button", { name: "Close the loop" }).click();

  await expect(page.getByRole("heading", { name: "Revenue Rescue: the bottleneck is the unresolved next decision for FinCore Labs." })).toBeVisible();
  await expect(page.getByText("TL;DR: Revenue Rescue: FinCore Labs")).toBeVisible();
  await expect(page.getByText("Source · Slack thread or channel notes")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Send one founder-led follow-up to FinCore Labs/ })).toBeVisible();
  await expect(page.getByText("Review ·")).toBeVisible();
  await expect(page.getByTestId("primary-action-review")).toBeVisible();
  await expect(page.getByTestId("source-support")).toBeVisible();
  await expect(page.getByText("These snippets are pulled from the pasted context.")).toBeVisible();
  await expect(page.getByText("FinCore Labs has been stuck in negotiation")).toBeVisible();
  await expect(page.getByTestId("tune-before-saving")).toBeVisible();
  await expect(page.getByText("Deadline logic")).toBeVisible();
  await expect(page.getByTestId("short-diagnosis")).toBeVisible();
  await expect(page.getByTestId("supporting-context")).toBeVisible();
  await expectSectionOrder(page, "primary-action-review", "short-diagnosis");
  await expectSectionOrder(page, "primary-action-review", "supporting-context");
  await expectSectionOrder(page, "short-diagnosis", "supporting-context");

  await page.getByTestId("editable-founder-action").fill("Call FinCore and BrightLayer today, assign one owner, and confirm the next decision step.");
  await page.getByTestId("editable-done-when").fill("Both accounts have one owner, one next step, and one written follow-up note.");
  await page.getByTestId("editable-review-decision").fill("Should we keep founder-led follow-up on these two accounts next week?");
  await page.getByTestId("editable-review-date").fill("2026-07-21");
  await page.getByTestId("editable-metric").fill("Two late-stage accounts with confirmed next steps.");
  await expect(page.getByRole("heading", { name: /Call FinCore and BrightLayer today/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Should we keep founder-led follow-up on these two accounts next week/ })).toBeVisible();

  await page.getByRole("button", { name: "Copy memo" }).click();
  const copiedMemo = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiedMemo).toContain("Call FinCore and BrightLayer today");
  expect(copiedMemo).toContain("Both accounts have one owner");
  expect(copiedMemo).toContain("Should we keep founder-led follow-up on these two accounts next week?");
  expect(copiedMemo).toContain("2026-07-21");
  expect(copiedMemo).toContain("Two late-stage accounts with confirmed next steps.");

  await page.locator("[data-testid='supporting-context'] summary").click();
  await expect(page.getByText("Why this is the bottleneck")).toBeVisible();
  await expect(page.getByText("Evidence from your notes")).toBeVisible();
  await expect(page.getByText("Missing context")).toBeVisible();

  await expect(page.getByRole("button", { name: "Save action and review decision" })).toBeVisible();
  await page.getByRole("button", { name: "Save action and review decision" }).click();
  await expect(page.getByRole("button", { name: "Action and decision saved" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Saved. Review this next week." })).toBeVisible();
  await expect(
    page.getByText("Keep the no-account loop alive with a calendar file, copyable reminder, or text backup.")
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Add review to calendar" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy review reminder" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download loop as text" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open decision log" })).toHaveAttribute("href", "/decision-log");
  await expect(page.getByRole("button", { name: "Memo copied" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Optional Notion export" })).toBeVisible();
  await expect(
    page.getByText("Outbound export only. Notion is not used for import, sync, or persistence.")
  ).toBeVisible();
  await expect(page.locator('input[type="email"]')).toHaveCount(0);
  await expect(page.getByText("Create account")).toHaveCount(0);
  await expect(page.getByText("Sign in")).toHaveCount(0);
  await expect(page.getByText("Log in")).toHaveCount(0);

  await page.getByRole("button", { name: "Copy review reminder" }).click();
  const copiedReminder = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiedReminder).toContain("Review ThoroughLoop decision on Jul 21, 2026");
  expect(copiedReminder).toContain("Call FinCore and BrightLayer today");
  expect(copiedReminder).toContain("Two late-stage accounts with confirmed next steps.");

  const calendarDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Add review to calendar" }).click();
  const calendarDownload = await calendarDownloadPromise;
  expect(calendarDownload.suggestedFilename()).toContain("2026-07-21");
  const calendarPath = await calendarDownload.path();
  expect(calendarPath).toBeTruthy();
  const calendarContents = await readFile(calendarPath ?? "", "utf8");
  expect(calendarContents).toContain("DTSTART;VALUE=DATE:20260721");
  expect(calendarContents).toContain("Call FinCore and BrightLayer today");

  const textDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download loop as text" }).click();
  const textDownload = await textDownloadPromise;
  expect(textDownload.suggestedFilename()).toContain("2026-07-21");
  const textPath = await textDownload.path();
  expect(textPath).toBeTruthy();
  const textContents = await readFile(textPath ?? "", "utf8");
  expect(textContents).toContain("Call FinCore and BrightLayer today");
  expect(textContents).toContain("Both accounts have one owner");
  expect(textContents).toContain("Two late-stage accounts with confirmed next steps.");

  await page.getByRole("button", { name: "Start new loop" }).click();
  await expect(page.getByRole("heading", { name: "Saved loops" })).toBeVisible();
  await expect(page.getByText("Revenue Rescue: FinCore Labs").first()).toBeVisible();
  await expect(page.getByText("Source · Slack thread or channel notes")).toBeVisible();
  await expect(page.getByText("Call FinCore and BrightLayer today")).toBeVisible();
  await expect(page.getByText("Both accounts have one owner")).toBeVisible();

  await page.goto("/memos");
  await expect(page.getByRole("heading", { name: "Saved founder memos" })).toBeVisible();
  await expect(page.getByText("Revenue Rescue: FinCore Labs")).toBeVisible();
  await expect(page.getByText("Source: Slack thread or channel notes")).toBeVisible();
  await expect(page.getByText("Call FinCore and BrightLayer today")).toBeVisible();
  await expect(page.getByText("Both accounts have one owner")).toBeVisible();
  await expect(page.getByText("Jul 21, 2026")).toBeVisible();
  const savedMemoOrder = await page.getByTestId("saved-memo-detail-grid").evaluate((grid) => {
    const text = grid.textContent ?? "";
    return (
      text.indexOf("Founder action") !== -1 &&
      text.indexOf("Recommended decision") !== -1 &&
      text.indexOf("Problem") !== -1 &&
      text.indexOf("Founder action") < text.indexOf("Recommended decision") &&
      text.indexOf("Recommended decision") < text.indexOf("Problem")
    );
  });
  expect(savedMemoOrder).toBe(true);

  await page.reload();
  await expect(page.getByText("Revenue Rescue: FinCore Labs")).toBeVisible();

  await page.goto("/action-queue");
  await expect(page.getByRole("heading", { name: "One action per memo" })).toBeVisible();
  await expect(page.getByText("Call FinCore and BrightLayer today")).toBeVisible();
  await expect(page.getByText("Both accounts have one owner")).toBeVisible();
  await expect(page.getByText("Source: Slack thread or channel notes")).toBeVisible();

  await page.goto("/decision-log");
  await expect(page.getByRole("heading", { name: "Decisions to review next week" })).toBeVisible();
  await expect(page.getByText("Should we keep founder-led follow-up on these two accounts next week?")).toBeVisible();
  await expect(page.locator('input[type="date"]')).toHaveValue("2026-07-21");
  await expect(page.locator('label:has-text("Metric to watch") input')).toHaveValue("Two late-stage accounts with confirmed next steps.");
  await expect(page.getByText("Source: Slack thread or channel notes")).toBeVisible();

  await page.goto("/workflows/weekly-review");
  await expect(page.getByRole("heading", { name: "Review previous decision" })).toBeVisible();
  await expect(page.getByText("Should we keep founder-led follow-up on these two accounts next week?")).toBeVisible();

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 1000 }
  ]) {
    await page.setViewportSize(viewport);

    await page.goto("/workflows");
    await expectReadableContrast(page.getByRole("heading", { name: "Revenue Rescue", exact: true }));

    await page.goto("/memos");
    await expectReadableContrast(page.getByRole("heading", { name: "Revenue Rescue: FinCore Labs", exact: true }));
    await expectReadableContrast(page.getByPlaceholder("Search memos", { exact: true }));

    await page.goto("/action-queue");
    await expectReadableContrast(
      page.getByRole("heading", {
        name: "Call FinCore and BrightLayer today, assign one owner, and confirm the next decision step.",
        exact: true
      })
    );
    await expectReadableContrast(page.getByLabel("Owner", { exact: true }));

    await page.goto("/decision-log");
    await expectReadableContrast(
      page.getByRole("heading", {
        name: "Should we keep founder-led follow-up on these two accounts next week?",
        exact: true
      })
    );
    await expectReadableContrast(page.getByLabel("Metric to watch", { exact: true }));

    await page.goto("/settings");
    await expectReadableContrast(page.getByText("Founder name", { exact: true }));
    await expectReadableContrast(page.getByLabel("Founder name", { exact: true }));

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);
  }
});

test("workflow route uses structured context and the canonical atomic save", async ({ page }) => {
  await page.goto("/workflows/revenue-rescue");
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: new URL(page.url()).origin
  });
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  const rawNotes =
    "FinCore Labs has been stuck after pricing. The buyer has not confirmed who owns the final decision. The proposal is open and founder follow-up is overdue.";
  await page.getByLabel("Messy context", { exact: true }).fill(rawNotes);
  await page.getByLabel("Deal name", { exact: true }).fill("FinCore Labs");
  await page.getByLabel("Stage", { exact: true }).fill("Negotiation");
  await page.getByLabel("Owner", { exact: true }).fill("Founder");
  await page.getByLabel("Last activity", { exact: true }).fill("Pricing discussion 12 days ago");
  await page.getByLabel("Next step", { exact: true }).fill("Confirm commercial objection and decision process");
  await page.getByRole("button", { name: "Diagnose this mess", exact: true }).click();

  const missingContext = page.getByTestId("diagnosis-missing-context");
  await expect(missingContext).toContainText("Deal value");
  await expect(missingContext).toContainText("Close probability");
  await expect(missingContext).not.toContainText("Owner");
  await expect(missingContext).not.toContainText("Last activity date");
  await expect(missingContext).not.toContainText("Next step");
  await expect(page.getByText("FinCore Labs Stage", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Generate founder memo", exact: true }).click();
  await expect(page.getByTestId("source-support")).toBeVisible();
  await expect(page.getByTestId("source-support")).toContainText("FinCore Labs has been stuck after pricing.");
  await expect(page.getByTestId("tune-before-saving")).toBeVisible();
  await expect(page.getByText("Deadline logic", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Follow up with FinCore Labs/ })).toBeVisible();

  await page.locator("[data-testid='supporting-context'] summary").click();
  await expect(page.getByText("Deal name: FinCore Labs", { exact: true })).toBeVisible();
  await expect(page.getByText("Stage: Negotiation", { exact: true })).toBeVisible();

  await page.getByTestId("editable-founder-action").fill("Call FinCore before Friday and confirm the commercial objection.");
  await page.getByTestId("editable-review-decision").fill("Should FinCore remain in founder-led follow-up next week?");
  await page.getByTestId("editable-review-date").fill("2026-07-24");
  await page.getByTestId("editable-metric").fill("One confirmed buyer decision step");
  await page.getByRole("button", { name: "Save action and review decision", exact: true }).click();

  const savedButton = page.getByRole("button", { name: "Action and decision saved", exact: true });
  await expect(savedButton).toBeDisabled();
  const savedCollections = await page.evaluate(() => {
    const memos = JSON.parse(window.localStorage.getItem("founder_os_lite_memos") ?? "[]");
    const actions = JSON.parse(window.localStorage.getItem("founder_os_lite_actions") ?? "[]");
    const decisions = JSON.parse(window.localStorage.getItem("founder_os_lite_decisions") ?? "[]");
    return { memos, actions, decisions };
  });

  expect(savedCollections.memos).toHaveLength(1);
  expect(savedCollections.actions).toHaveLength(1);
  expect(savedCollections.decisions).toHaveLength(1);
  expect(savedCollections.actions[0].sourceMemoId).toBe(savedCollections.memos[0].id);
  expect(savedCollections.decisions[0].sourceMemoId).toBe(savedCollections.memos[0].id);
  expect(savedCollections.actions[0].founderAction).toContain("Call FinCore before Friday");
  expect(savedCollections.decisions[0].decisionRecommended).toContain("Should FinCore remain");
  expect(savedCollections.decisions[0].reviewDate).toBe("2026-07-24");
  expect(savedCollections.decisions[0].metricToWatch).toBe("One confirmed buyer decision step");

  await page.getByRole("button", { name: "Start new loop", exact: true }).click();
  await page.getByLabel("Messy context", { exact: true }).fill("Need to fix follow ups.");
  await page.getByRole("button", { name: "Diagnose this mess", exact: true }).click();
  await page.getByRole("button", { name: "Generate founder memo", exact: true }).click();
  await expect(page.getByTestId("source-support")).toContainText(
    "No strong source snippet found. Add more concrete notes before trusting this task."
  );
  await expect(page.getByTestId("tune-before-saving")).toBeVisible();
});
