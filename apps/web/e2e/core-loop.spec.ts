import { expect, test, type Page } from "@playwright/test";

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

test("founder can complete the ThoroughLoop browser loop", async ({ page }) => {
  await page.goto("/");
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

  await expect(page.getByRole("heading", { name: "The bottleneck is discovery quality, not pricing." })).toBeVisible();
  await expect(page.getByText("TL;DR: Discovery quality, not pricing.")).toBeVisible();
  await expect(page.getByText("Source · Slack thread or channel notes")).toBeVisible();
  await expect(page.getByText("Sit in on the next two discovery calls")).toBeVisible();
  await expect(page.getByText("Review ·")).toBeVisible();
  await expect(page.getByTestId("primary-action-review")).toBeVisible();
  await expect(page.getByTestId("short-diagnosis")).toBeVisible();
  await expect(page.getByTestId("supporting-context")).toBeVisible();
  await expectSectionOrder(page, "primary-action-review", "short-diagnosis");
  await expectSectionOrder(page, "primary-action-review", "supporting-context");
  await expectSectionOrder(page, "short-diagnosis", "supporting-context");

  await page.locator("[data-testid='supporting-context'] summary").click();
  await expect(page.getByText("Why this is the bottleneck")).toBeVisible();
  await expect(page.getByText("Evidence from your notes")).toBeVisible();
  await expect(page.getByText("Missing context")).toBeVisible();

  await page.getByRole("button", { name: "Save loop" }).click();
  await expect(page.getByRole("button", { name: "Loop saved" })).toBeVisible();

  await page.getByRole("button", { name: "Start new loop" }).click();
  await expect(page.getByRole("heading", { name: "Saved loops" })).toBeVisible();
  await expect(page.getByText("Discovery quality, not pricing.").first()).toBeVisible();
  await expect(page.getByText("Source · Slack thread or channel notes")).toBeVisible();

  await page.goto("/memos");
  await expect(page.getByRole("heading", { name: "Saved founder memos" })).toBeVisible();
  await expect(page.getByText("Discovery quality, not pricing.")).toBeVisible();
  await expect(page.getByText("Source: Slack thread or channel notes")).toBeVisible();
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
  await expect(page.getByText("Discovery quality, not pricing.")).toBeVisible();

  await page.goto("/action-queue");
  await expect(page.getByRole("heading", { name: "One action per memo" })).toBeVisible();
  await expect(page.getByText("Sit in on the next two discovery calls")).toBeVisible();
  await expect(page.getByText("Source: Slack thread or channel notes")).toBeVisible();

  await page.goto("/decision-log");
  await expect(page.getByRole("heading", { name: "Decisions to review next week" })).toBeVisible();
  await expect(page.getByText("Should FinCore Labs stay in founder-led discovery")).toBeVisible();
  await expect(page.getByText("Source: Slack thread or channel notes")).toBeVisible();

  await page.goto("/workflows/weekly-review");
  await expect(page.getByRole("heading", { name: "Review previous decision" })).toBeVisible();
  await expect(page.getByText("Should FinCore Labs stay in founder-led discovery")).toBeVisible();
});
