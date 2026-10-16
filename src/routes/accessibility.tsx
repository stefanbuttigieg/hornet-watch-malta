import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection, Mail } from "@/components/LegalPage";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://hornet-watch-malta.lovable.app/accessibility" }],
    meta: [
      { property: "og:url", content: "https://hornet-watch-malta.lovable.app/accessibility" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Accessibility Statement — Hornet Watch Malta" },
      { name: "description", content: "Hornet Watch Malta's commitment to accessibility, known limitations and how to report a barrier." },
      { property: "og:title", content: "Accessibility Statement — Hornet Watch Malta" },
      { property: "og:description", content: "Our accessibility commitment and how to report a barrier." },
    ],
  }),
  component: Accessibility,
});

function Accessibility() {
  return (
    <LegalPage title="Accessibility Statement">
      <LegalSection title="Our commitment">
        <p>We want everyone — including people using screen readers, keyboards or magnification — to be able to report and view hornet activity. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 level AA.</p>
      </LegalSection>
      <LegalSection title="What we've done">
        <ul className="list-disc space-y-1 pl-5">
          <li>High-contrast colours designed for outdoor sunlight.</li>
          <li>Large touch targets and a mobile-first layout.</li>
          <li>Labelled form fields and the option to pick a locality from a list instead of the map.</li>
          <li>Pages work when zoomed up to 200%.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Known limitations">
        <ul className="list-disc space-y-1 pl-5">
          <li>The interactive map is hard to use with a keyboard or screen reader. You can use “Use my location” or choose a locality from the list instead, and data is available as a CSV download on the Impact page.</li>
          <li>Charts on the Impact page may not be fully described for screen readers.</li>
          <li>Photos submitted by the public do not have text descriptions.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Status">
        <p>This site is partially compliant with WCAG 2.1 AA because of the limitations above. This statement was prepared on 16 October 2026 based on a self-assessment.</p>
      </LegalSection>
      <LegalSection title="Report a barrier">
        <p>If something doesn't work for you, email <Mail /> describing the page and the problem. We aim to reply within 10 working days.</p>
      </LegalSection>
    </LegalPage>
  );
}
