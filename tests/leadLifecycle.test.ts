import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveHistoryStepNumber,
  groupOutreachHistoryBySlug,
  deriveLeadStatus,
  statusAfterStepSent,
  canSendOutreachStep,
  computePipelineCounters,
} from "@/lib/leadLifecycle";

test("resolveHistoryStepNumber maps legacy types and explicit stepNumber accurately", () => {
  assert.equal(resolveHistoryStepNumber({ stepNumber: 3, type: "INITIAL" }), 3);
  assert.equal(resolveHistoryStepNumber({ type: "INITIAL" }), 1);
  assert.equal(resolveHistoryStepNumber({ type: "FOLLOW_UP_CREDENTIALS_AND_OFFER" }), 2);
  assert.equal(resolveHistoryStepNumber({ type: "VALUE_DROP" }), 3);
  assert.equal(resolveHistoryStepNumber({ type: "BREAKUP" }), 4);
});

test("groupOutreachHistoryBySlug and deriveLeadStatus progress from history while preserving terminal overrides", () => {
  const bySlug = groupOutreachHistoryBySlug([
    { slug: "acme", stepNumber: 1, sentAt: "2026-01-01T09:00:00Z" },
    { slug: "acme", stepNumber: 2, sentAt: "2026-01-05T09:00:00Z" },
    { slug: "beta", stepNumber: 4, sentAt: "2026-01-10T09:00:00Z" },
  ]);

  assert.equal(deriveLeadStatus(undefined, bySlug.get("acme")), "CONTACTED_STEP_2");
  assert.equal(deriveLeadStatus("NEW", bySlug.get("acme")), "CONTACTED_STEP_2");
  assert.equal(deriveLeadStatus("HOT_LEAD", bySlug.get("acme")), "HOT_LEAD");
  assert.equal(deriveLeadStatus("BLACKLISTED", bySlug.get("beta")), "BLACKLISTED");
  assert.equal(deriveLeadStatus("INVALID_TICKET_INBOX", bySlug.get("acme")), "INVALID_TICKET_INBOX");
  assert.equal(deriveLeadStatus(undefined, undefined), "NEW");
});

test("canSendOutreachStep and statusAfterStepSent enforce sequential transitions and blocked states", () => {
  assert.equal(canSendOutreachStep("BLACKLISTED", 1).allowed, false);
  assert.equal(canSendOutreachStep("INVALID_TICKET_INBOX", 2).allowed, false);
  assert.equal(canSendOutreachStep("NEW", 2).allowed, false);
  assert.equal(canSendOutreachStep("NEW", 1).allowed, true);
  assert.equal(canSendOutreachStep("CONTACTED_STEP_1", 2).allowed, true);

  assert.equal(statusAfterStepSent(1), "CONTACTED_STEP_1");
  assert.equal(statusAfterStepSent(2), "CONTACTED_STEP_2");
  assert.equal(statusAfterStepSent(3), "CONTACTED_STEP_3");
  assert.equal(statusAfterStepSent(4), "CONTACTED_STEP_4");
});

test("computePipelineCounters aggregates all statuses consistently", () => {
  const counters = computePipelineCounters([
    "NEW",
    "NEW",
    "CONTACTED_STEP_1",
    "CONTACTED_STEP_2",
    "CONTACTED_STEP_3",
    "CONTACTED_STEP_4",
    "HOT_LEAD",
    "BLACKLISTED",
    "INVALID_TICKET_INBOX",
  ]);

  assert.deepEqual(counters, {
    total: 9,
    new: 2,
    step1: 1,
    step2: 1,
    step3: 1,
    step4: 1,
    hot: 1,
    blocked: 2,
  });
});
