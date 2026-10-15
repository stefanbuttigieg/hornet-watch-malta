# Malta Oriental Hornet Tracker

A public, mobile-first map where anyone in Malta & Gozo can report hornet activity, and beekeepers and policy makers can see whether interventions are working.

## What people can do

**Report (no login)** — a short form with a map pin (tap map or use phone location), date, optional photo and notes:
- Hornet sighting — number seen, behaviour (hawking at hive, foraging, at flowers)
- Nest found — size, height, status (active / destroyed / unknown)
- Hive damage — apiary pin, hives total, hives lost/weakened
- Intervention — type (trap, nest removal, bait station, entrance reducer/muzzle), start date; traps can get repeat "catch counts" later

**Map** — Malta-centred map with filters by report type and date range, colour-coded pins, and a heatmap toggle for sightings and losses.

**Effectiveness dashboard** (for policy makers)
- Before/after by area: for each intervention, compare sightings and hive losses within 1–2 km for the 4 weeks before vs after, shown as a % change with a simple verdict (improving / no change / worsening) and a "not enough data" warning when counts are low.
- Trap catch trends: hornets caught per trap per week, line charts, and a ranking of trap types.
- Locality summary: hotspots by locality, totals for hives lost, nests destroyed.
- CSV export for official use.

**Data quality** (since there is no login): photo encouraged, duplicate-report warning for nearby same-day reports, a "flag as wrong" button, and a hidden moderator page protected by a passcode to hide bad reports.

## Pages
- `/` — live map + "Report" button
- `/report` — report form
- `/dashboard` — effectiveness and trends
- `/about` — how to identify Vespa orientalis, safety advice, what to do if you find a nest
- `/moderate` — passcode-protected cleanup

## Design
Field-tool feel: warm honey amber and deep charcoal, high contrast for outdoor sunlight, big touch targets (most use will be on phones at the apiary).

## Technical details
- Lovable Cloud: tables `reports` (type, lat/lng, data fields, photo url, created_at, hidden), `trap_catches` (intervention_id, date, count), `flags`; public insert + select of non-hidden rows via RLS; photo storage bucket with size limits.
- Map: Google Maps (managed connector) with heatmap/markers; clustering for density.
- Effectiveness math in a server function (haversine radius, before/after windows), with unit tests for the comparison rule.
- Charts with recharts. Moderator passcode stored as a secret, checked server-side.
- Seed a few demo reports so the map and dashboard aren't empty on first open (clearly labelled as demo, removable).
