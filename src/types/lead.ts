export type InboundReplyClassification =
  | 'AUTO_REPLY_OR_TICKET'
  | 'POSITIVE_REQUEST_LINK'
  | 'SKEPTICAL_OR_OBJECTION'
  | 'UNSUBSCRIBE_OR_NO';

export interface OutreachStep {
  dayOffset: number;
  subject: string;
  body: string;
  inThread: boolean;
  requiresFollowUpCall?: boolean;
}

export interface LeadConfig {
  slug: string;
  archetype: 'local-leadgen' | 'medical-clinic' | 'b2b-authority';
  meta: {
    companyName: string;
    decisionMakerName: string; // Estratto da Privacy Policy / Chi Siamo / Team o ricavato da email nominale
    decisionMakerFirstName?: string | null;
    decisionMakerRole?: string | null;
    isGenericInbox?: boolean;
    emailScore?: number;
    targetEmail: string;
    phone: string;
    city: string;
    vatNumber?: string;
    adLibraryUrl: string;
    originalLandingUrl: string;
    status?:
      | 'NEW'
      | 'CONTACTED_STEP_1'
      | 'CONTACTED_STEP_2'
      | 'CONTACTED_STEP_3'
      | 'CONTACTED_STEP_4'
      | 'HOT_LEAD'
      | 'INVALID_TICKET_INBOX'
      | 'MANUAL_LINKEDIN_QUEUE'
      | 'BLACKLISTED';
  };
  audit: {
    originalLcpSeconds: number;
    mobileScore: number; // 0-100
    renderBlockingCount?: number;
    runsAds?: boolean;
    detectedTrackingSignals?: string[];
    activeAdHeadline: string;
    activeAdCopySummary: string;
    threeCriticalFlaws: [string, string, string];
  };
  theme: {
    primaryHex: string;
    accentHex: string;
    darkBgHex: string;
    borderRadius: '0px' | '4px' | '6px' | '8px' | '12px' | '16px';
    secondaryHex?: string;
    headerBgMode?: 'light' | 'dark' | 'adaptive';
    headerBgHex?: string;
    logoBrightness?: 'dark' | 'light';
  };
  content: {
    badgeTop: string;
    heroHeadline: string; // Message Match 1:1 con activeAdHeadline
    heroSubheadline: string;
    heroBullets?: [string, string, string]; // 3 benefici immediati sopra la piega
    ctaButtonText: string;
    secondaryCtaText?: string;
    trustMicrocopy: string;
    logoLocalPath: string; // Es. "/leads/rossi-impianti/logo.png"
    heroImageLocalPath: string; // Es. "/leads/rossi-impianti/hero.jpg"
    heroImageCaption?: string;
    quiz: {
      question1: { title: string; options: [string, string, string] };
      question2: { title: string; options: [string, string, string] };
      finalStepTitle: string;
    };
    valueProps: Array<{ title: string; description: string; metric?: string }>;
    socialProof: {
      mainStatValue: string;
      mainStatLabel: string;
      secondaryStats?: Array<{ value: string; label: string }>;
      reviewsSummary: string;
      clientReferenceWall?: string[]; // Per B2B Logo/Reference Wall
      testimonials: Array<{ name: string; location: string; quote: string; roleOrContext?: string }>;
    };
    medicalDetails?: {
      directorName: string;
      alboRegistration: string; // Es. "Iscr. Albo Odontoiatri di Milano n. 4821"
      specialization: string;
      clinicAddress: string;
      openingHours: string;
      parkingAndAccess: string;
      conventions: string[];
    };
  };
  outreach: {
    emailSubject: string;
    emailPlainTextBody: string; // Alias retrocompatibile di step1FirstTouch.body (Zero link, 65-85 parole)
    followUpWithLinkBody: string; // Alias retrocompatibile di step2FollowUpLink.body
    step1FirstTouch?: OutreachStep; // Giorno 1: Diagnosi tecnica + proposta invio demo (zero link)
    step2FollowUpLink?: OutreachStep; // Giorno 4 (In-Thread o su risposta positiva): Link demo live 0.3s + invito call 10 min
    step3ValueDropAndCallTrigger?: OutreachStep; // Giorno 8 (In-Thread): Focus collo di bottiglia + requiresFollowUpCall: true
    step4Breakup?: OutreachStep; // Giorno 13 (In-Thread): Breakup cortese senza pressione
  };
}
