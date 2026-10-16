import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection, Mail } from "@/components/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://hornetwatchmalta.live/terms" }],
    meta: [
      { property: "og:url", content: "https://hornetwatchmalta.live/terms" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Terms and Conditions — Hornet Watch Malta" },
      { name: "description", content: "Rules for using Hornet Watch Malta and submitting hornet reports." },
      { property: "og:title", content: "Terms and Conditions — Hornet Watch Malta" },
      { property: "og:description", content: "Rules for using Hornet Watch Malta and submitting reports." },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalPage title="Terms and Conditions">
      <LegalSection title="About the service">
        <p>Hornet Watch Malta is a free, community-run tool for mapping the oriental hornet in Malta and Gozo. By using it you agree to these terms.</p>
      </LegalSection>
      <LegalSection title="Submitting reports">
        <ul className="list-disc space-y-1 pl-5">
          <li>Only submit reports that are honest and to the best of your knowledge accurate.</li>
          <li>Don't include personal information about yourself or others, or offensive content.</li>
          <li>Only upload photos you took or have the right to share.</li>
          <li>By submitting, you allow your report to be shown publicly and shared (including as CSV) for research, beekeeping and policy purposes.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Moderation">
        <p>Reports may be hidden or removed if they appear wrong, duplicated, abusive or spam.</p>
      </LegalSection>
      <LegalSection title="Safety">
        <p><strong>Never try to destroy a nest yourself.</strong> Contact a licensed pest controller or your local council. In an emergency, call 112. Guidance on this site is general information, not professional advice.</p>
      </LegalSection>
      <LegalSection title="No guarantee">
        <p>Data is submitted by the public and may be incomplete or inaccurate. Effectiveness results are indicative signals, not a scientific study. The service is provided “as is”, and to the extent allowed by law we are not liable for decisions made using it.</p>
      </LegalSection>
      <LegalSection title="Changes and law">
        <p>These terms may be updated; the date above shows the latest version. They are governed by the laws of Malta.</p>
      </LegalSection>
      <LegalSection title="Contact">
        <p><Mail /></p>
      </LegalSection>
    </LegalPage>
  );
}
