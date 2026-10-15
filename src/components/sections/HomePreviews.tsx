import Link from "next/link";
import { siteContent } from "@/config/siteContent";
import { ArrowRightIcon } from "@/components/ui/Icons";

/**
 * =====================================================================
 * ANTEPRIME HOME (SERVIZI · PROGETTI · STUDIO)
 * Solo un accenno: titolo, una frase e un link verso la pagina dedicata.
 * Nessun box, nessun badge: filetti sottili e molto respiro.
 * I prezzi sono gli stessi del listino, solo in forma compatta.
 * =====================================================================
 */

// Etichette compatte del listino (stessi importi di siteContent.services)
const compactPricing: Record<string, { label: string; price: string }> = {
  "audit-consulenza": { label: "Audit & consulenza", price: "30 min gratis, poi 70€/h" },
  "landing-page": { label: "Landing page", price: "900€" },
  "sito-corporate": { label: "Sito corporate", price: "2.000€ – 4.000€" },
  ecosistema: { label: "Web app & ecosistema B2B", price: "5.000€ – 15.000€" },
};

function DiscoverLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-sans font-semibold text-[#0B1E36] hover:text-[#B8860B] transition-colors group"
    >
      <span>{children}</span>
      <ArrowRightIcon className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function HomePreviews() {
  const { services, brand } = siteContent;

  const previews = [
    {
      key: "servizi",
      title: "Servizi",
      text: "Quattro soluzioni chiare, con prezzo certo prima di iniziare.",
      href: "/servizi",
      cta: "Scopri i servizi",
    },
    {
      key: "progetti",
      title: "Progetti",
      text: "Architetture reference con demo live e codice pubblico.",
      href: "/progetti",
      cta: "Scopri i progetti",
    },
    {
      key: "studio",
      title: "Studio",
      text: `${brand.founder}, 18 anni, fondatore e capo dello studio.`,
      href: "/studio",
      cta: "Scopri lo studio",
    },
  ];

  return (
    <section aria-label="In breve" className="py-14 sm:py-20 md:py-24 bg-[#F8F7F4]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-10 lg:gap-x-14">
          {previews.map((p) => (
            <div key={p.key} className="pt-6 border-t border-[#E8E2D5] space-y-3">
              <h2 className="font-serif text-2xl sm:text-[1.75rem] text-[#14181F] font-normal tracking-tight">
                {p.title}
              </h2>
              <p className="text-sm sm:text-base text-[#5A6270] leading-relaxed font-sans max-w-sm">
                {p.text}
              </p>

              {p.key === "servizi" && (
                <ul className="pt-1 space-y-1.5 text-sm font-sans max-w-sm">
                  {services.items.map((item) => {
                    const compact = compactPricing[item.id];
                    return (
                      <li key={item.id} className="flex items-baseline justify-between gap-4">
                        <span className="text-[#5A6270]">{compact?.label ?? item.name}</span>
                        <span className="text-[#0B1E36] font-medium whitespace-nowrap">
                          {compact?.price ?? item.price}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2">
                <DiscoverLink href={p.href}>{p.cta}</DiscoverLink>
                {p.key === "servizi" && (
                  <DiscoverLink href="/servizi#simulatore">Stima il progetto</DiscoverLink>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
