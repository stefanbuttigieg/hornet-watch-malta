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
- Intervention effectiveness maths lives in src/lib/effectiveness.ts as pure functions with unit tests; UI only renders results.
- Reports are public (no login): anon insert/select via RLS; moderation uses a passcode secret checked in server functions.
