import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const Route = createFileRoute("/credits")({
  head: () => ({
    meta: [
      { title: "Credits & Sources — Hornet Watch Malta" },
      { name: "description", content: "Photo credits, licences and information sources used by Hornet Watch Malta." },
      { property: "og:title", content: "Credits & Sources — Hornet Watch Malta" },
      { property: "og:description", content: "Who took the photos and where the information about Vespa orientalis comes from." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Credits,
});

const ext = { target: "_blank", rel: "noopener noreferrer", className: "font-semibold underline" } as const;

const IMAGES = [
  { what: "Oriental hornet feeding on prickly pear", by: "Zeynel Cebeci", lic: "CC BY-SA 4.0", licUrl: "https://creativecommons.org/licenses/by-sa/4.0/", src: "https://commons.wikimedia.org/wiki/File:Do%C4%9Fu_E%C5%9Fekar%C4%B1s%C4%B1_-_Vespa_orientalis_-_Oriental_hornet_01.JPG" },
  { what: "Hornets at a nest in a rock crevice", by: "Kreta", lic: "Public domain", licUrl: "https://creativecommons.org/publicdomain/mark/1.0/", src: "https://commons.wikimedia.org/wiki/File:Oosterse_hoornaar_Vespa_orientalis.JPG" },
  { what: "Comb from an oriental hornet nest", by: "Zeynel Cebeci", lic: "CC BY-SA 4.0", licUrl: "https://creativecommons.org/licenses/by-sa/4.0/", src: "https://commons.wikimedia.org/wiki/File:Comb_of_Vespa_orientalis_-_Oriental_hornet,_Adana_2016-12-04_01-1.jpg" },
];

const SOURCES = [
  { name: "Wild Plants of Malta and Gozo — Vespa orientalis (Oriental Hornet)", url: "https://maltawildplants.com/!faunafungi/maltawildlife.php?species=Vespa+orientalis", used: "Classification, size and diet." },
  { name: "Environment and Resources Authority (ERA) — BioSnippet 60: Oriental Hornet", url: "https://era.org.mt/wp-content/uploads/2023/05/BioSnippet_60-Oriental_Hornet.pdf", used: "Appearance, native status in Malta, population history, diet and behaviour towards people." },
  { name: "Albanozzo, M. (2021). The status of Vespa orientalis in Malta: a preliminary study. University of Malta", url: "https://www.um.edu.mt/library/oar/handle/123456789/96311", used: "Active season and distribution in Malta." },
];

function Credits() {
  return (
    <LegalPage title="Credits & Sources">
      <LegalSection title="Photos">
        <p>Photos in the Guide come from Wikimedia Commons. They were resized for the web; no other changes were made.</p>
        <ul className="list-disc space-y-2 pl-5">
          {IMAGES.map((i) => (
            <li key={i.src}>
              {i.what} — by {i.by}, licensed <a {...ext} href={i.licUrl}>{i.lic}</a>. <a {...ext} href={i.src}>Original</a>
            </li>
          ))}
        </ul>
      </LegalSection>
      <LegalSection title="Information sources">
        <ul className="list-disc space-y-2 pl-5">
          {SOURCES.map((s) => (
            <li key={s.url}><a {...ext} href={s.url}>{s.name}</a><div className="text-sm text-muted-foreground">Used for: {s.used}</div></li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">Safety and hive-protection tips in the Guide are general advice; please follow guidance from licensed pest controllers and the authorities.</p>
      </LegalSection>
      <LegalSection title="Map">
        <p>Map data © <a {...ext} href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>, shown with <a {...ext} href="https://leafletjs.com/">Leaflet</a>.</p>
      </LegalSection>
      <LegalSection title="Reports">
        <p>All hornet, nest, hive damage and intervention reports are submitted by members of the public.</p>
      </LegalSection>
    </LegalPage>
  );
}
