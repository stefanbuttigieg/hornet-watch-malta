import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";

export const CONTACT_EMAIL = "info@stefanbuttigieg.com";
export const LAST_UPDATED = "16 October 2026";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>
        {children}
      </main>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2 leading-relaxed">
      <h2 className="text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

export function Mail() {
  return <a className="font-semibold underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
}
