import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TechPyre - Outbound Engine Command Center",
  description: "Dashboard privata di scouting Meta Ad Library, CRO audit e invio email",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${jakarta.className} min-h-screen bg-zinc-950 text-zinc-100 antialiased`}>
      {children}
    </div>
  );
}
