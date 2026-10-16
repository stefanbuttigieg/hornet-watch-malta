import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection, Mail } from "@/components/LegalPage";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://hornet-watch-malta.lovable.app/cookies" }],
    meta: [
      { property: "og:url", content: "https://hornet-watch-malta.lovable.app/cookies" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Cookies Policy — Hornet Watch Malta" },
      { name: "description", content: "Hornet Watch Malta uses no tracking or advertising cookies. Learn what is stored on your device." },
      { property: "og:title", content: "Cookies Policy — Hornet Watch Malta" },
      { property: "og:description", content: "No tracking cookies — only what's needed for the site to work." },
    ],
  }),
  component: Cookies,
});

function Cookies() {
  return (
    <LegalPage title="Cookies Policy">
      <LegalSection title="Short version">
        <p>We do <strong>not</strong> use advertising, analytics or tracking cookies. That's why there is no cookie banner.</p>
      </LegalSection>
      <LegalSection title="What is stored on your device">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Confirmed reports</strong> — when you press “I saw this too”, your browser remembers it (local storage) so you can't confirm the same report twice by accident. It never leaves your device.</li>
          <li><strong>Strictly necessary technical storage</strong> set by our hosting provider to deliver and secure the site.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Third-party content">
        <p>Map images come from OpenStreetMap and typefaces from Google Fonts. These services receive your IP address when loading, but we do not allow them to set tracking cookies through our site.</p>
      </LegalSection>
      <LegalSection title="Managing storage">
        <p>You can clear cookies and site data at any time in your browser settings. The site will keep working; you'll just be able to confirm reports again.</p>
      </LegalSection>
      <LegalSection title="Questions">
        <p>Email <Mail />.</p>
      </LegalSection>
    </LegalPage>
  );
}
