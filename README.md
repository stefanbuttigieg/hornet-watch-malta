# Hornet Watch Malta

**A public, community-driven map for tracking the oriental hornet (*Vespa orientalis*) across Malta and Gozo — and for measuring whether the interventions against it actually work.**

🔗 **Live app:** [hornet-watch-malta.lovable.app](https://hornetwatchmalta.live)

---

## Why this exists

Malta is facing a surge in oriental hornets, and beekeepers are losing large numbers of hives. Traps, nest removals, bait stations and entrance reducers are being deployed, but there has been no shared, island-wide picture of *where* the pressure is and *which* measures are making a difference.

Hornet Watch Malta gives beekeepers, the public and policy makers one place to:

- **Report** hornet activity in seconds from a phone, no account needed.
- **See** hotspots, nests and hive losses on a live map.
- **Measure** the before/after effect of each intervention with transparent, reproducible maths.

## Features

### Report (no login)
Drop a pin (tap the map or use your phone's location), pick a date, add an optional photo and notes.

| Report type | What you record |
| --- | --- |
| Hornet sighting | Number seen, behaviour (hawking at hives, foraging, on flowers/fruit) |
| Nest found | Status (active / destroyed / unknown) |
| Hive damage | Hives in the apiary, hives lost or weakened |
| Intervention | Trap, nest removal, bait station, entrance reducer / muzzle — traps can log repeat weekly catch counts |

### Live map
- Malta-centred OpenStreetMap view with colour-coded pins
- Filter by report type and date range
- Hotspot view for sightings and losses

### Impact dashboard
- **Before / after by area** — for every intervention, compares nearby sightings and hive losses in the weeks before vs after, with a clear verdict: *improving*, *no change*, *worsening* or *not enough data*
- **Trap catch trends** — hornets caught per trap over time
- **Locality summary** — hotspots, hives lost and nests destroyed by locality
- **CSV export** for official analysis

### Data quality
- Photos encouraged as evidence
- Nearby same-day duplicate warning
- "Flag as wrong" on any report
- Passcode-protected moderation page to hide bad or spam reports

### Guide
How to recognise *Vespa orientalis*, stay safe, and what to do if you find a nest.

## How effectiveness is measured

The rule is deliberately simple so anyone can check it. It lives in [`src/lib/effectiveness.ts`](src/lib/effectiveness.ts) as pure functions with unit tests.

| Parameter | Value |
| --- | --- |
| Radius around the intervention | **1.5 km** |
| Comparison window | **28 days before vs 28 days after** the start date |
| Change counted as real | **±25%** or more |
| Minimum nearby reports (before + after) | **4** — otherwise *not enough data* |

> ⚠️ Results reflect what people report, not a controlled study. Small counts can produce large percentages, and reporting effort varies by area and season. Treat verdicts as signals for further investigation.

## Public API

Read-only JSON, no key needed, CORS open, cached for 60 seconds. Only reports that have not been hidden by moderators are returned. Photo files are never exposed (`has_photo` only).

| Endpoint | Filters |
| --- | --- |
| `GET /api/public/v1/reports` | `type` (sighting, nest, hive_damage, intervention), `since`, `until` (YYYY-MM-DD), `locality`, `limit` (max 5000) |
| `GET /api/public/v1/trap-catches` | `since`, `until`, `limit` |

Example: `https://hornetwatchmalta.live/api/public/v1/reports?type=nest&since=2026-09-01`

Response: `{ "count": 2, "data": [ ... ] }`

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19, Vite, server functions)
- TypeScript, Tailwind CSS v4, shadcn/ui
- [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/) tiles
- Recharts for charts
- Lovable Cloud (Postgres with row-level security, file storage)
- Vitest for tests

## Project structure

```text
src/
  routes/          Pages: map (/), report, dashboard, about, moderate
  components/      Map, header and shared UI
  lib/
    effectiveness.ts       Before/after maths (pure, unit-tested)
    reports.ts             Data queries, labels, localities, CSV export
    moderation.functions.ts  Passcode-checked moderation server functions
```

## Getting started

Requirements: Node.js 20+ (or Bun).

```sh
git clone <this-repository-url>
cd hornet-watch-malta
npm install
npm run dev
```

Useful scripts:

```sh
npm test        # run unit tests
npm run lint    # lint
npm run build   # production build
```

### Environment

The app expects a backend with the `reports` and `trap_catches` tables. Client settings are read from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The moderation page requires a server-side `MODERATOR_PASSCODE` secret — never commit it.

## Privacy & safety

- Reports are public. Please don't include names, phone numbers or exact home addresses in notes.
- Photos are stored privately and shown through short-lived links.
- **Never try to destroy a nest yourself.** Contact a licensed pest controller or your local council. In an emergency, call **112**.

## Reporting issues & feedback

- **GitHub Issues:** open a [new issue](../../issues/new) with what happened, the page, your device/browser, and a screenshot if possible. Wrong locality or map problems are welcome too.
- **Email:** [info@stefanbuttigieg.com](mailto:info@stefanbuttigieg.com) — no GitHub account needed.

## Contributing

Contributions are welcome — especially from beekeepers, entomologists and anyone working on hornet control in Malta.

1. Open an issue describing the bug or idea.
2. Fork, create a branch, and keep changes focused.
3. Run `npm test` and `npm run lint` before opening a pull request.

Changes to the effectiveness rules should include updated tests and a short explanation of the reasoning.

## Acknowledgements

Built with [Lovable](https://lovable.dev). Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

## License

No license has been chosen yet. Until one is added, all rights are reserved by the author.
