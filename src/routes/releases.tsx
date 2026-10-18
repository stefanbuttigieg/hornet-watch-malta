import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/releases")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://hornetwatchmalta.live/releases" }],
    meta: [
      { title: "Release Log — Hornet Watch Malta" },
      { name: "description", content: "The history of Hornet Watch Malta: public reporting, map improvements, safer submissions, moderation, news and more." },
      { property: "og:title", content: "Release Log — Hornet Watch Malta" },
      { property: "og:description", content: "Follow the updates to Malta’s community hornet reporting and intervention tracking tool." },
      { property: "og:url", content: "https://hornetwatchmalta.live/releases" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReleaseLog,
});

const updates = [
  {
    title: "A public release log",
    category: "Transparency",
    changes: [
      "Added this page to bring the site’s update history together, with a permanent link in the footer.",
    ],
  },
  {
    title: "Checks for safer reporting",
    category: "Quality assurance",
    changes: [
      "Added end-to-end tests that submit real reports and verify that sea locations are rejected.",
      "Checked that optional reporter emails appear only in passcode-protected moderation, not on the public map, CSV exports or public API.",
      "Tests cover reports with and without an email and remove their temporary reports afterwards. Location lookups are simulated for repeatable coastline checks.",
    ],
  },
  {
    title: "Sea-pin checks and optional reporter contact",
    category: "Reporting",
    changes: [
      "Added a location check to the report form to reject pins identified as being in the sea. If the location service is unavailable, reporting remains possible.",
      "Added an optional email field so moderators can ask a reporter for clarification. Emails are kept separate from public report data.",
      "Added an ‘Ask reporter’ email link in moderation and updated the Privacy Policy. Contact details are deleted with their report.",
    ],
  },
  {
    title: "Report totals, photo checks and moderator editing",
    category: "Map & moderation",
    changes: [
      "Added total report counts and counts by report type on the impact page, excluding hidden reports and those awaiting review.",
      "Added a report count to the map’s bottom summary, following the selected filters.",
      "Verified photo submission, storage and viewing from a map pin using a real test report, then removed it.",
      "Added moderator editing for pin location, locality, hornet count and notes, allowing misplaced reports to be corrected.",
    ],
  },
  {
    title: "Main-site search links and a data check",
    category: "Site maintenance",
    changes: [
      "Updated canonical page addresses, social sharing addresses, the sitemap and search-crawler instructions to hornetwatchmalta.live.",
      "Investigated reports of missing map data and confirmed that submitted reports had not been lost at the time of the check.",
    ],
  },
  {
    title: "Posting limits and suspicious-report review",
    category: "Report protection",
    changes: [
      "Limited submissions to five reports an hour per shared internet connection, using a hashed address rather than storing the address itself. Hash records are removed after two days.",
      "Added an invisible form trap and a minimum filling-time check to discourage automated submissions.",
      "Added automatic review holds for unusually large counts, inconsistent hive totals and clusters of rapid reports near the same location.",
      "Added review reasons and an Approve action for moderators. Held reports stay off the public map, impact figures and data feed until approved.",
    ],
  },
  {
    title: "Local hornet news",
    category: "News",
    changes: [
      "Added a News page and recent headlines on the map homepage.",
      "Added English and Maltese hornet searches across local sources, including Fil-Qosor, Times of Malta, The Malta Independent, Newsbook and TVM.",
      "Backfilled hornet stories from 2026 and scheduled a daily check at 06:00 UTC. News matching uses headlines, so an unrelated story may occasionally appear.",
    ],
  },
  {
    title: "A hornet icon, search improvements and a public API",
    category: "Discovery & open data",
    changes: [
      "Added a custom hornet favicon and home-screen icon.",
      "Added page-specific search and social sharing information, a sitemap and crawler instructions; kept moderation out of search results.",
      "Added documented, read-only public feeds for reports and trap catches, with date filters and result limits. The reports feed excludes hidden reports and does not expose photo files.",
    ],
  },
  {
    title: "Species photos, sources and donations",
    category: "Guide & community",
    changes: [
      "Added real oriental hornet and nest photos to the Guide, with photographer and licence credits. The photos were not taken in Malta.",
      "Added species information citing Wild Plants of Malta and Gozo, the Environment and Resources Authority and University of Malta research.",
      "Added a Credits & Sources page for images, information and map attribution.",
      "Added a donation page linking to Stefan Buttigieg’s Buy Me a Coffee account, explaining that contributions are voluntary and go to Stefan personally.",
    ],
  },
  {
    title: "Privacy, terms and accessibility",
    category: "Your rights",
    changes: [
      "Added a Privacy Policy, Cookies Policy, Terms & Conditions and Accessibility Statement, linked from the footer.",
      "Added an email-based process to request a copy, correction or deletion of submitted report data, linked from the Privacy Policy.",
      "Documented browser storage used for report confirmations and known accessibility limitations. Policy wording remains subject to legal review.",
    ],
  },
  {
    title: "All local councils and community confirmations",
    category: "Community reporting",
    changes: [
      "Expanded the locality selector to all 68 local councils in Malta and Gozo, including Tarxien, without changing existing report locations or locality text.",
      "Added ‘I saw this too’ confirmations and confirmation counts on map reports, with a browser-based repeat-confirmation safeguard.",
      "Added guidance for confirmations and instructions for reporting issues by GitHub or email in the Guide and README.",
    ],
  },
  {
    title: "Hornet Watch Malta: a clean start",
    category: "Project identity",
    changes: [
      "Renamed the tool to Hornet Watch Malta throughout the site.",
      "Removed the existing reports and trap-catch data at the owner’s request so public reporting could start from scratch.",
      "Wrote a public README covering the project’s purpose, features, privacy, safety, effectiveness rules and contributing.",
    ],
  },
  {
    title: "The first Hornet Watch tool",
    category: "Initial release",
    changes: [
      "Introduced public reporting for hornet sightings, nests, hive damage and interventions, without requiring an account.",
      "Added an interactive OpenStreetMap map, filters and report photos.",
      "Added an impact page comparing nearby reporting before and after interventions, alongside trap-catch charts and CSV exports.",
      "Added passcode-protected moderation for managing public reports.",
    ],
  },
] as const;

function ReleaseLog() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <header className="border-b pb-8">
          <p className="mb-2 text-sm font-semibold text-muted-foreground">Hornet Watch Malta</p>
          <h1 className="text-3xl font-bold sm:text-4xl">Release log</h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">What changed, from the first reporting tool to the latest improvements.</p>
          <p className="mt-4 text-sm text-muted-foreground">Compiled on <time dateTime="2026-10-18">18 October 2026</time> · Newest updates first</p>
          <p className="mt-2 text-sm text-muted-foreground">Earlier changes are grouped in development order; exact release dates were not recorded. This log records development updates, not deployment dates.</p>
        </header>
        <div className="divide-y">
          {updates.map((update, index) => (
            <section key={update.title} aria-labelledby={`update-${index}`} className="py-7 sm:py-8">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                {update.category}
              </p>
              <h2 id={`update-${index}`} className="text-xl font-bold">{update.title}</h2>
              <ul className="mt-4 list-disc space-y-3 pl-5 leading-relaxed marker:text-muted-foreground">
                {update.changes.map((change) => <li key={change}>{change}</li>)}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}