import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Oriental hornet guide — Hornet Watch Malta" },
      { name: "description", content: "How to recognise the oriental hornet (Vespa orientalis), stay safe, and what to do if you find a nest in Malta." },
      { property: "og:title", content: "Oriental hornet guide — Hornet Watch Malta" },
      { property: "og:description", content: "Identify Vespa orientalis, protect your hives and report nests safely." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <div className="honeycomb rounded-2xl bg-ink p-6 text-ink-foreground">
          <h1 className="text-3xl font-bold">Know the oriental hornet</h1>
          <p className="mt-2 opacity-80">Vespa orientalis — locally “id-dabbur ahmar”. It hunts honeybees at the hive entrance and can wipe out weak colonies in late summer and autumn.</p>
        </div>
        <Section title="How to recognise it">
          <li>Large (2.5–3.5 cm), reddish-brown body.</li>
          <li>One or two bright yellow bands near the end of the abdomen, and a yellow patch on the face.</li>
          <li>Often seen hovering (“hawking”) in front of hives, catching bees in flight.</li>
          <li>Nests are usually underground, in walls, rubble or tree cavities.</li>
        </Section>
        <Section title="Stay safe">
          <li>Never try to destroy a nest yourself — stings can be dangerous, especially with many hornets.</li>
          <li>Keep at least 5 metres from a nest entrance and avoid vibrations near it.</li>
          <li>If stung and you feel faint or have trouble breathing, call 112 immediately.</li>
        </Section>
        <Section title="If you find a nest">
          <li>Note the location and take a photo from a safe distance.</li>
          <li>Report it here so it shows on the map, then contact a licensed pest controller or your local council.</li>
          <li>Once it’s removed, add a new “Nest found” report with status “destroyed”.</li>
        </Section>
        <Section title="Protecting your hives">
          <li>Reduce hive entrances or fit muzzles so bees can defend themselves.</li>
          <li>Use selective traps away from the apiary and log weekly catch counts on the Impact page.</li>
          <li>Report every intervention with its start date — this is how we measure what works.</li>
        </Section>
        <Link to="/report" className="inline-block rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">Report activity</Link>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-bold">{title}</h2>
      <ul className="list-disc space-y-1 pl-5">{children}</ul>
    </section>
  );
}
