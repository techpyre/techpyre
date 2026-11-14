import type { LeadConfig } from "@/types/lead";

export type LeadStatus = NonNullable<LeadConfig["meta"]["status"]>;

export interface OutreachHistoryEntry {
  slug?: string;
  companyName?: string;
  sentAt?: string;
  type?: string;
  stepNumber?: number;
  messageId?: string;
  sentBy?: string;
}

export interface LeadStepProgress {
  sentSteps: Set<number>;
  step1At?: string;
  step2At?: string;
  step3At?: string;
  step4At?: string;
  lastSentAt?: string;
  lastType?: string;
}

const VALID_STATUSES: ReadonlySet<string> = new Set([
  "NEW",
  "CONTACTED_STEP_1",
  "CONTACTED_STEP_2",
  "CONTACTED_STEP_3",
  "CONTACTED_STEP_4",
  "HOT_LEAD",
  "INVALID_TICKET_INBOX",
  "MANUAL_LINKEDIN_QUEUE",
  "BLACKLISTED",
]);

export function resolveHistoryStepNumber(entry: OutreachHistoryEntry): 1 | 2 | 3 | 4 {
  if (entry.stepNumber === 1 || entry.stepNumber === 2 || entry.stepNumber === 3 || entry.stepNumber === 4) {
    return entry.stepNumber;
  }
  if (entry.type === "STEP_4" || entry.type === "BREAKUP") return 4;
  if (entry.type === "STEP_3" || entry.type === "VALUE_DROP") return 3;
  if (
    entry.type === "STEP_2" ||
    entry.type === "FOLLOW_UP" ||
    entry.type === "FOLLOW_UP_CREDENTIALS_AND_OFFER"
  ) {
    return 2;
  }
  return 1;
}

export function groupOutreachHistoryBySlug(
  history: OutreachHistoryEntry[]
): Map<string, LeadStepProgress> {
  const bySlug = new Map<string, LeadStepProgress>();
  for (const entry of history) {
    if (!entry.slug) continue;
    let progress = bySlug.get(entry.slug);
    if (!progress) {
      progress = { sentSteps: new Set<number>() };
      bySlug.set(entry.slug, progress);
    }
    const step = resolveHistoryStepNumber(entry);
    progress.sentSteps.add(step);
    const sentAt = entry.sentAt;
    if (sentAt) {
      if (step === 1 && (!progress.step1At || sentAt < progress.step1At)) progress.step1At = sentAt;
      if (step === 2 && (!progress.step2At || sentAt > progress.step2At)) progress.step2At = sentAt;
      if (step === 3 && (!progress.step3At || sentAt > progress.step3At)) progress.step3At = sentAt;
      if (step === 4 && (!progress.step4At || sentAt > progress.step4At)) progress.step4At = sentAt;
      if (!progress.lastSentAt || sentAt > progress.lastSentAt) {
        progress.lastSentAt = sentAt;
        progress.lastType = entry.type || `STEP_${step}`;
      }
    }
  }
  return bySlug;
}

export function deriveLeadStatus(
  explicitStatus: LeadStatus | undefined,
  progress: LeadStepProgress | undefined
): LeadStatus {
  if (
    explicitStatus === "HOT_LEAD" ||
    explicitStatus === "BLACKLISTED" ||
    explicitStatus === "INVALID_TICKET_INBOX" ||
    explicitStatus === "MANUAL_LINKEDIN_QUEUE"
  ) {
    return explicitStatus;
  }
  const steps = progress?.sentSteps;
  const highestStep = steps && steps.size > 0 ? Math.max(...steps) : 0;
  if (highestStep >= 4) return "CONTACTED_STEP_4";
  if (highestStep === 3) return "CONTACTED_STEP_3";
  if (highestStep === 2) return "CONTACTED_STEP_2";
  if (highestStep === 1) return "CONTACTED_STEP_1";

  if (explicitStatus && VALID_STATUSES.has(explicitStatus)) {
    return explicitStatus;
  }
  return "NEW";
}

export function statusAfterStepSent(step: 1 | 2 | 3 | 4): LeadStatus {
  if (step === 4) return "CONTACTED_STEP_4";
  if (step === 3) return "CONTACTED_STEP_3";
  if (step === 2) return "CONTACTED_STEP_2";
  return "CONTACTED_STEP_1";
}

export function canSendOutreachStep(
  status: LeadStatus,
  step: 1 | 2 | 3 | 4
): { allowed: boolean; reason?: string } {
  if (status === "BLACKLISTED" || status === "INVALID_TICKET_INBOX") {
    return { allowed: false, reason: `Lead bloccato in stato ${status}.` };
  }
  if (step > 1 && status === "NEW") {
    return { allowed: false, reason: "Esegui prima lo Step 1 (First Touch)." };
  }
  return { allowed: true };
}

export interface PipelineCounters {
  total: number;
  new: number;
  step1: number;
  step2: number;
  step3: number;
  step4: number;
  hot: number;
  blocked: number;
}

export function computePipelineCounters(statuses: LeadStatus[]): PipelineCounters {
  const counters: PipelineCounters = {
    total: statuses.length,
    new: 0,
    step1: 0,
    step2: 0,
    step3: 0,
    step4: 0,
    hot: 0,
    blocked: 0,
  };
  for (const status of statuses) {
    if (status === "NEW") counters.new++;
    else if (status === "CONTACTED_STEP_1") counters.step1++;
    else if (status === "CONTACTED_STEP_2") counters.step2++;
    else if (status === "CONTACTED_STEP_3") counters.step3++;
    else if (status === "CONTACTED_STEP_4") counters.step4++;
    else if (status === "HOT_LEAD") counters.hot++;
    else counters.blocked++;
  }
  return counters;
}
