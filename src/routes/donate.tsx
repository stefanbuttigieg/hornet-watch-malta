import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";

const COFFEE_URL = "https://buymeacoffee.com/stefanbuttigieg";

export const Route = createFileRoute("/donate")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://hornetwatchmalta.live/donate" }],
    meta: [
      { property: "og:url", content: "https://hornetwatchmalta.live/donate" },
      { title: "Support Hornet Watch Malta — Donate" },
      { name: "description", content: "Help keep Hornet Watch Malta free by buying Stefan Buttigieg a coffee." },
      { property: "og:title", content: "Support Hornet Watch Malta" },
      { property: "og:description", content: "Buy Stefan Buttigieg a coffee to help keep this free hornet tracker running." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Donate,
});

function Donate() {
  return (
    <LegalPage title="Support Hornet Watch Malta">
      <LegalSection title="Buy me a coffee">
        <p>Hornet Watch Malta is free for everyone and built in my spare time by Stefan Buttigieg. If it helps you or your bees, you can say thanks with a coffee.</p>
        <p>Donations go to me personally and help cover hosting and time spent improving the app. They are voluntary and not tax-deductible.</p>
        <a href={COFFEE_URL} target="_blank" rel="noopener noreferrer"
          className="mt-2 inline-block rounded-md bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground">
          ☕ Buy me a coffee
        </a>
      </LegalSection>
      <LegalSection title="Other ways to help">
        <ul className="list-disc space-y-1 pl-5">
          <li>Report every sighting, nest and intervention.</li>
          <li>Confirm reports you've seen too.</li>
          <li>Share the app with beekeepers and your local council.</li>
        </ul>
      </LegalSection>
    </LegalPage>
  );
}
