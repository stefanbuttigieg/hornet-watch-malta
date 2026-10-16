import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LegalPage, LegalSection, Mail, CONTACT_EMAIL } from "@/components/LegalPage";

export const Route = createFileRoute("/data-request")({
  head: () => ({
    meta: [
      { title: "Request access or deletion of your data — Hornet Watch Malta" },
      { name: "description", content: "How to ask Hornet Watch Malta for a copy of, a correction to, or deletion of a report you submitted." },
      { property: "og:title", content: "Data requests — Hornet Watch Malta" },
      { property: "og:description", content: "Ask for access to, correction or deletion of a hornet report you submitted." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DataRequest,
});

const KINDS = { access: "a copy of", correct: "a correction to", delete: "deletion of" } as const;
type Kind = keyof typeof KINDS;

function DataRequest() {
  const [kind, setKind] = useState<Kind>("delete");
  const [date, setDate] = useState("");
  const [place, setPlace] = useState("");
  const [details, setDetails] = useState("");

  const subject = `Data request: ${kind} — Hornet Watch Malta`;
  const body = `Hello,\n\nI would like ${KINDS[kind]} a report I submitted.\n\nDate of the report: ${date}\nLocality / location: ${place}\nReport type and details (e.g. number of hornets, notes, photo): ${details}\n\nThank you.`;
  const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const field = "w-full rounded-md border bg-background px-3 py-3 text-base";

  return (
    <LegalPage title="Request access to or deletion of your data">
      <LegalSection title="How it works">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Fill in the details below so we can find your report. There are no accounts, so we identify reports by date, place and content.</li>
          <li>Press <strong>Send request by email</strong>. Your email app opens with the message ready — just send it.</li>
          <li>We reply within <strong>one month</strong>, as required by the GDPR. We may ask a question to make sure the report is yours.</li>
        </ol>
        <p>You can also write directly to <Mail />.</p>
      </LegalSection>

      <section className="space-y-4 rounded-lg border bg-card p-4">
        <fieldset className="space-y-2">
          <legend className="font-semibold">What would you like?</legend>
          {(["access", "correct", "delete"] as Kind[]).map((k) => (
            <label key={k} className="flex items-center gap-3 py-1">
              <input type="radio" name="kind" checked={kind === k} onChange={() => setKind(k)} className="h-5 w-5" />
              {k === "access" ? "A copy of my report" : k === "correct" ? "Correct my report" : "Delete my report"}
            </label>
          ))}
        </fieldset>
        <label className="block space-y-1">
          <span className="font-semibold">Date of the report</span>
          <input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="font-semibold">Locality or location</span>
          <input className={field} value={place} onChange={(e) => setPlace(e.target.value)} placeholder="e.g. Tarxien, near the parish church" />
        </label>
        <label className="block space-y-1">
          <span className="font-semibold">Anything else that helps us find it</span>
          <textarea className={field} rows={3} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Report type, number of hornets, notes you wrote, whether you added a photo" />
        </label>
        <a href={href} className="inline-block rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground">
          Send request by email
        </a>
      </section>

      <LegalSection title="Good to know">
        <ul className="list-disc space-y-1 pl-5">
          <li>Deleting a report also deletes its photo and any trap catch counts linked to it.</li>
          <li>Please don't include extra personal details beyond what we need to find the report.</li>
          <li>Read more in our <Link to="/privacy" className="font-semibold underline">Privacy Policy</Link>.</li>
        </ul>
      </LegalSection>
    </LegalPage>
  );
}
