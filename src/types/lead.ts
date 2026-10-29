export interface LeadConfig {
  slug: string;
  archetype: 'local-leadgen' | 'medical-clinic' | 'b2b-authority';
  meta: {
    companyName: string;
    decisionMakerName: string; // Estratto da Privacy Policy / Chi Siamo / LinkedIn
    targetEmail: string;
    phone: string;
    city: string;
    vatNumber?: string;
    adLibraryUrl: string;
    originalLandingUrl: string;
  };
  audit: {
    originalLcpSeconds: number;
    mobileScore: number; // 0-100
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
    emailPlainTextBody: string; // Zero link, CTA di risposta "LINK"
    followUpWithLinkBody: string; // La risposta pronta quando il cliente scrive "SÌ / LINK"
  };
}
