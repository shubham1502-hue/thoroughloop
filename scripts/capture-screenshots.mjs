import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const targetUrl = process.env.THOROUGHLOOP_CAPTURE_URL || "https://thoroughloop.vercel.app";
const outputDir = path.join(process.cwd(), "docs", "assets", "screenshots");

const demoInput =
  "FinCore Labs is stuck in negotiation after a pricing concern. BrightLayer AI has not replied after proposal for 12 days. Northstar Ops completed demo but is waiting for internal review. I keep adding new leads, but the late-stage pipeline feels soft. Discovery may be too shallow because buyers cannot repeat the business case back clearly.";

const skipped = [];

async function waitForFonts(page) {
  await page.evaluate(async () => {
    if ("fonts" in document) {
      await document.fonts.ready;
    }
  });
}

async function capture(page, fileName) {
  await waitForFonts(page);
  const filePath = path.join(outputDir, fileName);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`captured ${fileName}`);
}

async function scrollToLocator(page, locator, block = "start") {
  await locator.evaluate((element, scrollBlock) => {
    element.scrollIntoView({ block: scrollBlock, inline: "nearest" });
  }, block);
  await page.waitForTimeout(250);
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  try {
    page.setDefaultTimeout(10000);
    await page.goto(targetUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => window.localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });

    await page.evaluate(() => window.scrollTo(0, 0));
    await capture(page, "01-landing-page.png");

    await scrollToLocator(page, page.locator("#samples"));
    await capture(page, "02-sample-context-options.png");

    await page.getByRole("button", { name: /Stalled pipeline/i }).click();
    await page.getByTestId("messy-context-input").fill(demoInput);
    await capture(page, "03-messy-founder-context.png");

    await page.getByRole("button", { name: "Close the loop" }).click();
    const thinkingHeading = page.getByRole("heading", { name: "Finding the actual bottleneck" });
    try {
      await thinkingHeading.waitFor({ state: "visible", timeout: 150 });
      await capture(page, "04-thinking-state.png");
    } catch {
      skipped.push("04-thinking-state.png");
      console.log("skipped 04-thinking-state.png because the thinking state completed before capture");
    }

    await page.getByRole("heading", { name: "The bottleneck is discovery quality, not pricing." }).waitFor({
      state: "visible"
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await capture(page, "05-generated-diagnosis.png");

    await scrollToLocator(page, page.getByText("Why this is the bottleneck"));
    await capture(page, "06-founder-memo-evidence.png");

    await scrollToLocator(page, page.getByText("Founder action this week"));
    await capture(page, "07-founder-action-decision.png");

    await page.getByRole("button", { name: "Save loop" }).click();
    await page.getByRole("button", { name: "Loop saved" }).waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Start new loop" }).click();
    await page.getByRole("heading", { name: "Saved loops" }).waitFor({ state: "visible" });
    await scrollToLocator(page, page.locator("#saved-history"));
    await capture(page, "08-saved-loops.png");
  } finally {
    await browser.close();
  }

  if (skipped.length > 0) {
    console.log(`skipped: ${skipped.join(", ")}`);
  }

  console.log(`screenshots saved to ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
