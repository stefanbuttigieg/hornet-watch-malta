import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, LegalSection, Mail } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://hornetwatchmalta.live/privacy" }],
    meta: [
      { property: "og:url", content: "https://hornetwatchmalta.live/privacy" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Privacy Policy — Hornet Watch Malta" },
      { name: "description", content: "How Hornet Watch Malta collects, uses and protects information submitted in hornet reports." },
      { property: "og:title", content: "Privacy Policy — Hornet Watch Malta" },
      { property: "og:description", content: "What data Hornet Watch Malta collects and your rights under the GDPR." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <LegalSection title="Who we are">
        <p>Hornet Watch Malta is a community project run by Stefan Buttigieg, who is the data controller. Contact: <Mail />.</p>
      </LegalSection>
      <LegalSection title="What we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>Report details you choose to submit: report type, map location, date, counts, behaviour, nest status, hive numbers, intervention type, notes and an optional photo.</li>
          <li>Anonymous counters when you confirm or flag a report.</li>
          <li>We do <strong>not</strong> ask for your name, email or phone number, and there are no user accounts.</li>
          <li>Like any website, our hosting provider processes technical data (such as IP address and browser type) to deliver the site and keep it secure.</li>
          <li>To stop abuse, each report you send records a scrambled, one-way code made from your IP address (not the address itself, and never shown with your report). It is used only to limit everyone to 5 reports an hour and is deleted after 2 days.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Why we use it (legal basis)">
        <p>To map oriental hornet activity and measure which interventions work, in the public interest of protecting bees and beekeeping in Malta (GDPR Art. 6(1)(e) and legitimate interests, Art. 6(1)(f)).</p>
      </LegalSection>
      <LegalSection title="Who can see it">
        <ul className="list-disc space-y-1 pl-5">
          <li>Reports (except photos) are public on the map, the impact page and in the CSV download.</li>
          <li>Photos are stored privately and only shown through short-lived links.</li>
          <li>Please don't put names, phone numbers or home addresses in notes or photos.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Third parties">
        <ul className="list-disc space-y-1 pl-5">
          <li>Lovable (hosting and database), with data processed in line with the GDPR.</li>
          <li>OpenStreetMap tile servers, which load map images and see your IP address.</li>
          <li>Google Fonts, which loads the site's typefaces and sees your IP address.</li>
        </ul>
      </LegalSection>
      <LegalSection title="How long we keep it">
        <p>Reports are kept while the project is active, as a long-term record of the hornet situation. Spam or wrong reports are hidden or removed by moderators.</p>
      </LegalSection>
      <LegalSection title="Your rights">
        <p>You may ask for access to, correction or erasure of information you submitted, or object to its use. Use our <Link to="/data-request" className="font-semibold underline">data request page</Link> for step-by-step instructions and a ready-made email, or email <Mail /> with the date and location of the report. We reply within one month. You can also complain to Malta's Information and Data Protection Commissioner (idpc.org.mt).</p>
      </LegalSection>
    </LegalPage>
  );
}
