/**
 * =====================================================================
 * PRECOMPILAZIONE DEL MODULO DI CONTATTO TRA PAGINE
 * Il modulo (#contatto) vive nella home. Le CTA di Servizi, Simulatore e
 * Progetti possono trovarsi su altre pagine:
 * - se il modulo è presente nella pagina corrente → evento custom + scroll
 *   (comportamento originale invariato)
 * - altrimenti → il precompilato viene salvato in sessionStorage e si
 *   naviga (router di Next.js) a /#contatto, dove ContactBox lo legge e lo
 *   applica al mount
 * =====================================================================
 */

export const CONTACT_PREFILL_STORAGE_KEY = "techpyre:contact-prefill";
export const CONTACT_PATH = "/#contatto";

export interface ContactPrefill {
  serviceTitle: string;
  prefilledMessage?: string;
}

export function requestContactPrefill(
  prefill: ContactPrefill,
  navigate: (href: string) => void
): void {
  if (typeof window === "undefined") return;

  const contactEl = document.getElementById("contatto");

  if (contactEl) {
    if (prefill.prefilledMessage !== undefined) {
      window.dispatchEvent(
        new CustomEvent("techpyre:select-service-with-details", { detail: prefill })
      );
    } else {
      window.dispatchEvent(
        new CustomEvent("techpyre:select-service", {
          detail: { serviceTitle: prefill.serviceTitle },
        })
      );
    }
    contactEl.scrollIntoView({ behavior: "smooth" });
    return;
  }

  try {
    window.sessionStorage.setItem(CONTACT_PREFILL_STORAGE_KEY, JSON.stringify(prefill));
  } catch {
    // sessionStorage non disponibile (es. modalità privata restrittiva): si naviga comunque al modulo
  }
  navigate(CONTACT_PATH);
}

/** Legge e consuma (una sola volta) il precompilato salvato da un'altra pagina. */
export function consumeContactPrefill(): ContactPrefill | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CONTACT_PREFILL_STORAGE_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(CONTACT_PREFILL_STORAGE_KEY);
    const parsed = JSON.parse(raw) as Partial<ContactPrefill>;
    if (typeof parsed?.serviceTitle !== "string" || !parsed.serviceTitle) return null;
    return {
      serviceTitle: parsed.serviceTitle,
      prefilledMessage:
        typeof parsed.prefilledMessage === "string" ? parsed.prefilledMessage : undefined,
    };
  } catch {
    return null;
  }
}
