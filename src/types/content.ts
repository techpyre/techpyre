export interface BrandConfig {
  name: string;
  founder: string;
  tagline: string;
  contactEmail: string;
  phone: string;
  location: string;
  badge: string;
  availabilityNote: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface NavigationConfig {
  links: NavItem[];
  cta: {
    label: string;
    href: string;
  };
}

export interface HeroPillar {
  id: string;
  title: string;
  description: string;
}

export interface HeroConfig {
  badge: string;
  headline: {
    line1: string;
    highlight: string;
    line2: string;
  };
  subheadline: string;
  primaryCta: {
    label: string;
    href: string;
    note: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  pillars: HeroPillar[];
}

export interface ServiceItem {
  id: string;
  number: string;
  name: string;
  price: string;
  priceSubtext: string;
  summary: string;
  description: string;
  deliverables: string[];
  timing: string;
  target: string;
  ctaText: string;
}

export interface ServicesConfig {
  eyebrow: string;
  title: string;
  subtitle: string;
  guarantee: string;
  items: ServiceItem[];
}

export interface FounderComparison {
  legacyTitle: string;
  legacyPoints: string[];
  techPyreTitle: string;
  techPyrePoints: string[];
}

export interface CaseStudyMetric {
  label: string;
  value: string;
  subtext?: string;
}

export interface CaseStudyItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  metrics: CaseStudyMetric[];
  stack: string[];
  highlights: string[];
  ctaText: string;
  prefillService: string;
  /** Sandbox interattiva pubblica (nessun login richiesto) */
  demoUrl?: string;
  /** Repository GitHub pubblico con il codice sorgente */
  repoUrl?: string;
}

export interface CaseStudiesConfig {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: CaseStudyItem[];
}

export interface FounderConfig {
  eyebrow: string;
  title: string;
  subtitle: string;
  name: string;
  role: string;
  ageBadge?: string;
  engineeringBadge?: string;
  leadershipBadge?: string;
  manifesto: string[];
  quote: string;
  comparison: FounderComparison;
}

export interface ContactChannel {
  label: string;
  value: string;
  subtext: string;
  href: string;
  isExternal?: boolean;
}

export interface ContactConfig {
  eyebrow: string;
  title: string;
  subtitle: string;
  formLabels: {
    name: string;
    namePlaceholder: string;
    company: string;
    companyPlaceholder: string;
    contact: string;
    contactPlaceholder: string;
    service: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    privacyNote: string;
  };
  channels: ContactChannel[];
  feedback: {
    successTitle: string;
    successMessage: string;
    successReset: string;
    errorTitle: string;
    errorMessage: string;
  };
}

export interface FooterLinkGroup {
  title: string;
  items: Array<{
    label: string;
    href: string;
    isExternal?: boolean;
  }>;
}

export interface FooterConfig {
  summary: string;
  copyright: string;
  links: FooterLinkGroup[];
}

export interface SiteContent {
  brand: BrandConfig;
  navigation: NavigationConfig;
  hero: HeroConfig;
  services: ServicesConfig;
  caseStudies: CaseStudiesConfig;
  founder: FounderConfig;
  contact: ContactConfig;
  footer: FooterConfig;
}

export interface ContactPayload {
  name: string;
  company?: string;
  contact: string;
  service: string;
  message: string;
}

export interface ContactApiResponse {
  success: boolean;
  message: string;
  data?: {
    id?: string;
    timestamp?: string;
    mockMode?: boolean;
  };
  errors?: Record<string, string>;
}
