import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import hornet1 from "@/assets/guide/hornet-1.jpg";
import hornet2 from "@/assets/guide/hornet-2.jpg";
import hornetComb from "@/assets/guide/hornet-comb.jpg";

const PHOTOS = [
  {
    src: hornet1, wide: true,
    alt: "Oriental hornet with reddish-brown body and yellow abdomen bands feeding on prickly pear fruit",
    caption: "Close-up: reddish-brown body with the bright yellow band near the tail. Often seen on ripe fruit such as prickly pears.",
    credit: "Zeynel Cebeci", license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Do%C4%9Fu_E%C5%9Fekar%C4%B1s%C4%B1_-_Vespa_orientalis_-_Oriental_hornet_01.JPG",
  },
  {
    src: hornet2, wide: false,
    alt: "Several oriental hornets at a nest entrance in a limestone rock face",
    caption: "Hornets going in and out of a nest in a rock crevice — typical of rubble walls and rock faces in Malta.",
    credit: "Kreta", license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Oosterse_hoornaar_Vespa_orientalis.JPG",
  },
  {
    src: hornetComb, wide: false,
    alt: "Grey papery comb cells from an oriental hornet nest",
    caption: "Inside a nest: grey, papery comb. If you see this, keep away and contact a pest controller.",
    credit: "Zeynel Cebeci", license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Comb_of_Vespa_orientalis_-_Oriental_hornet,_Adana_2016-12-04_01-1.jpg",
  },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://hornetwatchmalta.live/about" }],
    meta: [
      { property: "og:url", content: "https://hornetwatchmalta.live/about" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
        <section className="space-y-2">
          <h2 className="text-xl font-bold">About the species in Malta</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>The largest wasp found in Europe and Malta (<em>Vespa orientalis</em> Linnaeus, 1771; family Vespidae).</li>
            <li>Despite its name, it is native to the Maltese Islands. It became very rare in the 1960s–70s, but numbers have risen again, mostly around towns and apiaries.</li>
            <li>Adults feed on nectar and sugary foods for energy, and hunt insects (including honeybees) to feed their larvae.</li>
            <li>Colonies are seasonal: a single queen starts a new nest in spring. In Malta the active season runs roughly from late April to mid-November.</li>
            <li>It is not aggressive to people unless threatened — avoid touching it or waving your hands.</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Sources:{" "}
            <a className="underline" href="https://maltawildplants.com/!faunafungi/maltawildlife.php?species=Vespa+orientalis" target="_blank" rel="noopener noreferrer">Wild Plants of Malta and Gozo</a>,{" "}
            <a className="underline" href="https://era.org.mt/wp-content/uploads/2023/05/BioSnippet_60-Oriental_Hornet.pdf" target="_blank" rel="noopener noreferrer">Environment and Resources Authority (ERA)</a>,{" "}
            <a className="underline" href="https://www.um.edu.mt/library/oar/handle/123456789/96311" target="_blank" rel="noopener noreferrer">Albanozzo (2021), University of Malta</a>.{" "}
            See all <Link to="/credits" className="underline">Credits & Sources</Link>.
          </p>
        </section>
        <Section title="How to recognise it">
          <li>Large (2.5–3.5 cm), reddish-brown body.</li>
          <li>One or two bright yellow bands near the end of the abdomen, and a yellow patch on the face.</li>
          <li>Often seen hovering (“hawking”) in front of hives, catching bees in flight.</li>
          <li>Nests are usually underground, in walls, rubble or tree cavities.</li>
        </Section>
        <div className="grid gap-4 sm:grid-cols-2">
          {PHOTOS.map((p) => (
            <figure key={p.src} className={`overflow-hidden rounded-2xl border bg-card ${p.wide ? "sm:col-span-2" : ""}`}>
              <img src={p.src} alt={p.alt} loading="lazy" width={960} height={640} className="h-auto w-full object-cover" />
              <figcaption className="space-y-1 p-3 text-sm">
                <div>{p.caption}</div>
                <div className="text-xs text-muted-foreground">
                  Photo: {p.credit}, <a className="underline" href={p.source} target="_blank" rel="noopener noreferrer">{p.license}</a> via Wikimedia Commons
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
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
        <Section title="Confirming other reports">
          <li>Saw the same hornets or nest? Tap a pin on the map and press “I saw this too”.</li>
          <li>Confirmed reports carry more weight for beekeepers and policy makers.</li>
        </Section>
        <section id="feedback" className="space-y-2 rounded-2xl border bg-card p-5">
          <h2 className="text-xl font-bold">Feedback, bugs & missing information</h2>
          <p>Found a problem, a wrong locality, or have an idea? Tell us either way:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>GitHub:</strong> open an issue on the project's GitHub repository (Issues tab → “New issue”). Describe what happened, the page, your device, and add a screenshot if you can.
            </li>
            <li>
              <strong>Email:</strong>{" "}
              <a className="font-semibold underline" href="mailto:info@stefanbuttigieg.com?subject=Hornet%20Watch%20Malta%20feedback">info@stefanbuttigieg.com</a>{" "}
              — no GitHub account needed.
            </li>
          </ul>
        </section>
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
