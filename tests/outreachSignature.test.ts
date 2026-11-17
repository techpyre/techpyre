import test from "node:test";
import assert from "node:assert/strict";
import {
  buildMultiStepOutreach,
  buildOutreachSignatureLines,
  getOutreachSignatureConfig,
  migrateOldLeadConfig,
} from "@/lib/scoutService";
import type { LeadConfig } from "@/types/lead";

function withEnv(vars: Record<string, string | undefined>, fn: () => void) {
  const previous = new Map<string, string | undefined>();
  for (const [k, v] of Object.entries(vars)) {
    previous.set(k, process.env[k]);
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    fn();
  } finally {
    for (const [k, v] of previous.entries()) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

test("getOutreachSignatureConfig and buildMultiStepOutreach include sender name and contacts without links in Step 1", () => {
  withEnv(
    {
      TECHPYRE_SIGNATURE_NAME: "Mario Rossi - TechPyre Studio",
      TECHPYRE_SIGNATURE_PHONE: "+39 333 000 0000",
      TECHPYRE_SIGNATURE_EMAIL: "mario.rossi@techpyre.eu",
      TECHPYRE_SIGNATURE_WEBSITE: "https://www.techpyre.eu",
    },
    () => {
      const cfg = getOutreachSignatureConfig();
      assert.equal(cfg.signatureName, "Mario Rossi - TechPyre Studio");
      assert.equal(cfg.signaturePhone, "+39 333 000 0000");
      assert.equal(cfg.signatureEmail, "mario.rossi@techpyre.eu");

      const step1Lines = buildOutreachSignatureLines({ includeWebsite: false });
      assert.ok(!step1Lines.some((l) => /https?:\/\//i.test(l)));

      const outreach = buildMultiStepOutreach({
        slug: "acme-srl",
        companyName: "Acme S.r.l.",
        decisionMaker: { fullName: null, firstName: null, role: null },
        isGenericInbox: true,
        estimatedMobileLcpSeconds: 7.2,
        renderBlockingScripts: 24,
        runsAds: false,
      });

      const s1 = outreach.step1FirstTouch?.body || "";
      const s2 = outreach.step2FollowUpLink?.body || "";
      const s3 = outreach.step3ValueDropAndCallTrigger?.body || "";
      const s4 = outreach.step4Breakup?.body || "";

      assert.equal(/https?:\/\//i.test(s1), false, "Step 1 must not contain clickable URLs");
      for (const body of [s1, s2, s3, s4]) {
        assert.ok(body.includes("Mario Rossi - TechPyre Studio"));
        assert.ok(body.includes("+39 333 000 0000"));
        assert.ok(body.includes("mario.rossi@techpyre.eu"));
      }
      for (const body of [s2, s3, s4]) {
        assert.ok(body.includes("https://www.techpyre.eu"));
      }
    }
  );
});

test("migrateOldLeadConfig upgrades outreach lacking contact details while preserving contacted subject", () => {
  withEnv(
    {
      TECHPYRE_SIGNATURE_NAME: "Mario Rossi - TechPyre Studio",
      TECHPYRE_SIGNATURE_PHONE: "+39 333 000 0000",
      TECHPYRE_SIGNATURE_EMAIL: "mario.rossi@techpyre.eu",
      TECHPYRE_SIGNATURE_WEBSITE: "https://www.techpyre.eu",
    },
    () => {
      const lead = {
        slug: "acme-srl",
        archetype: "b2b-authority",
        meta: {
          companyName: "Acme S.r.l.",
          decisionMakerName: "Direzione Acme S.r.l.",
          decisionMakerFirstName: null,
          decisionMakerRole: "Direzione Aziendale",
          isGenericInbox: true,
          emailScore: 35,
          targetEmail: "info@acme.it",
          phone: "021234567",
          city: "Milano",
          adLibraryUrl: "https://www.facebook.com/ads/library/",
          originalLandingUrl: "https://www.acme.it",
          status: "CONTACTED_STEP_1",
        },
        audit: {
          originalLcpSeconds: 7.6,
          mobileScore: 35,
          renderBlockingCount: 24,
          runsAds: false,
          detectedTrackingSignals: [],
          threeCriticalFlaws: ["a", "b", "c"],
          activeAdHeadline: "Acme",
          activeAdCopySummary: "Acme",
        },
        theme: {
          primaryHex: "#0B1E36",
          accentHex: "#B8860B",
          darkBgHex: "#0B1E36",
          borderRadius: "8px",
        },
        content: {
          badgeTop: "Acme",
          heroHeadline: "Acme",
          heroSubheadline: "Acme",
          heroBullets: ["a", "b", "c"],
          ctaButtonText: "Contatta",
          trustMicrocopy: "GDPR",
          logoLocalPath: "/leads/acme/logo.png",
          heroImageLocalPath: "/leads/acme/hero.jpg",
          heroImageCaption: "Acme",
          quiz: {
            question1: { title: "Q1", options: ["A", "B", "C"] },
            question2: { title: "Q2", options: ["A", "B", "C"] },
            finalStepTitle: "Final",
          },
          valueProps: [],
          socialProof: { mainStatValue: "99%", mainStatLabel: "OK", reviewsSummary: "OK" },
        },
        outreach: {
          emailSubject: "Oggetto Storico Custom",
          emailPlainTextBody: "Testo vecchio\n\nTechPyre Studio",
          followUpWithLinkBody: "Followup vecchio\n\nTechPyre Studio",
          step1FirstTouch: {
            dayOffset: 1,
            subject: "Oggetto Storico Custom",
            body: "Testo vecchio\n\nTechPyre Studio",
            inThread: false,
            requiresFollowUpCall: false,
          },
          step2FollowUpLink: {
            dayOffset: 4,
            subject: "Re: Oggetto Storico Custom",
            body: "Followup vecchio\n\nTechPyre Studio",
            inThread: true,
            requiresFollowUpCall: false,
          },
          step3ValueDropAndCallTrigger: {
            dayOffset: 8,
            subject: "Re: Oggetto Storico Custom",
            body: "Step 3 vecchio\n\nTechPyre Studio",
            inThread: true,
            requiresFollowUpCall: true,
          },
          step4Breakup: {
            dayOffset: 13,
            subject: "Re: Oggetto Storico Custom",
            body: "Step 4 vecchio\n\nTechPyre Studio",
            inThread: true,
            requiresFollowUpCall: false,
          },
        },
      } as unknown as LeadConfig;

      const migrated = migrateOldLeadConfig(lead, false);
      assert.equal(migrated.outreach.emailSubject, "Oggetto Storico Custom");
      assert.equal(migrated.outreach.step2FollowUpLink?.subject, "Re: Oggetto Storico Custom");
      assert.ok(migrated.outreach.step2FollowUpLink?.body.includes("Mario Rossi - TechPyre Studio"));
      assert.ok(migrated.outreach.step2FollowUpLink?.body.includes("+39 333 000 0000"));
      assert.ok(migrated.outreach.step2FollowUpLink?.body.includes("mario.rossi@techpyre.eu"));
      assert.ok(migrated.outreach.step3ValueDropAndCallTrigger?.body.includes("+39 333 000 0000"));
    }
  );
});
