import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createDiagnosis, generateFounderMemo } from "../src/index";
import { founderContextFixtures } from "./fixtures/founder-contexts";

describe("synthetic founder context fixtures", () => {
  for (const fixture of founderContextFixtures) {
    it(`classifies ${fixture.name}`, () => {
      const diagnosis = createDiagnosis(fixture.input);
      const memo = generateFounderMemo(diagnosis);

      assert.equal(diagnosis.workflow.name, fixture.expectedWorkflow);
      assert.ok(diagnosis.extractedRiskSignals.includes(fixture.expectedKeyRiskSignal));
      assert.match(memo.founderAction.toLowerCase(), new RegExp(fixture.expectedFounderActionTheme));
      assert.equal(memo.rawInput, fixture.input);
    });
  }

  it("keeps fixture company names fictional and extractable", () => {
    const gtmFixture = founderContextFixtures.find((fixture) => fixture.name === "GTM pipeline leakage");

    assert.ok(gtmFixture);

    const diagnosis = createDiagnosis(gtmFixture.input);

    assert.ok(diagnosis.extractedCompaniesOrDeals.includes("FinCore Labs"));
    assert.ok(diagnosis.extractedCompaniesOrDeals.includes("BrightLayer AI"));
  });
});
