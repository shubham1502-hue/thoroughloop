import { expect, test } from "@playwright/test";

const messyFounderContext =
  "FinCore Labs has been stuck in negotiation for 21 days after a pricing concern. BrightLayer AI has no reply after proposal for 12 days. Northstar Ops completed demo but is waiting for review. Founder follow-up is slipping and proposal-stage deals need attention this week.";

test("founder can complete the ThoroughLoop browser loop", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await page.getByTestId("messy-context-input").fill(messyFounderContext);
  await page.getByRole("button", { name: "Diagnose this mess" }).click();

  await expect(page.getByTestId("diagnosis-preview")).toBeVisible();
  await expect(page.getByTestId("diagnosis-preview")).toContainText("Revenue Rescue");
  await expect(page.getByTestId("diagnosis-preview")).toContainText("Pricing concern detected");

  await page.getByRole("button", { name: "Generate founder memo" }).click();
  await expect(page.getByTestId("founder-memo")).toBeVisible();
  await expect(page.getByTestId("founder-memo")).toContainText("Founder memo");

  await page.getByTestId("save-memo").click();
  await expect(page.getByText("Memo saved")).toBeVisible();

  await page.getByTestId("save-founder-action").click();
  await expect(page.getByText("Founder action saved")).toBeVisible();

  await page.getByTestId("save-decision").click();
  await expect(page.getByText("Decision saved")).toBeVisible();

  await page.goto("/memos");
  await expect(page.getByRole("heading", { name: "Saved founder memos" })).toBeVisible();
  await expect(page.getByText("Revenue Rescue memo for FinCore Labs")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Revenue Rescue memo for FinCore Labs")).toBeVisible();

  await page.goto("/action-queue");
  await expect(page.getByRole("heading", { name: "One action per memo" })).toBeVisible();
  await expect(page.getByText("Send one founder-led follow-up")).toBeVisible();

  await page.goto("/decision-log");
  await expect(page.getByRole("heading", { name: "Decisions to review next week" })).toBeVisible();
  await expect(page.getByText("Decide whether founder-led follow-up")).toBeVisible();

  await page.goto("/workflows/weekly-review");
  await expect(page.getByRole("heading", { name: "Review previous decision" })).toBeVisible();
  await expect(page.getByText("Decide whether founder-led follow-up")).toBeVisible();
});
