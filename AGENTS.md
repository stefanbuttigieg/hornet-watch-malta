<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Maps use Leaflet + OpenStreetMap tiles, loaded client-only via src/components/LazyMap.tsx (user declined Google Maps).
- Map photo thumbnails use permanent Leaflet tooltips so uploaded photos remain visible above their report pins without hover.
- Intervention effectiveness maths lives in src/lib/effectiveness.ts as pure functions with unit tests; UI only renders results.
- Reports are public (no login): anon insert/select via RLS; moderation uses a passcode secret checked in server functions.
- Browser end-to-end tests live in tests/e2e and use real report storage and moderation; only external geocoding is stubbed for determinism, and uniquely identified test reports are deleted in teardown.
- The public release log is a static, newest-first history in its own route; distinguish development history from deployment dates to avoid inventing release dates.
