# Report safety end-to-end tests

Run against an already running local app:

```sh
python3 -m unittest discover -s tests/e2e -p '*_e2e.py' -v
```

Requires Python Playwright with Chromium installed, `MODERATOR_PASSCODE`, and a
database connection through the standard `PGHOST`, `PGPORT`, `PGDATABASE`,
`PGUSER`, `PGPASSWORD`, and `PGSSLMODE` environment variables. Optional
`E2E_BASE_URL` defaults to `http://localhost:8080`. Only run against an app and
database you control. The test runner fails rather than skips if prerequisites
are missing.

The tests drive the real report form, Leaflet map, database, public API, CSV
download, and passcode-protected moderation page. OpenStreetMap reverse-geocoder
responses alone are stubbed (both sea response shapes and a land response), so
network outages or coastline changes cannot make the safety assertions flaky.
This does not test OpenStreetMap's accuracy or guarantee server-side sea rejection.

Two ordinary, uniquely labelled sighting reports are submitted: one with a
synthetic `example.com` email and one without. The tests never send email, alter
existing reports, or reset rate limits. Teardown deletes only those reports,
their cascading contact records, and rate-limit entries sharing their exact
database submission timestamp. Tests can legitimately fail if the test
connection has already reached its hourly posting limit.

Screenshots are saved under `/tmp/browser/report-safety/`. Moderation credentials
and real reporters' emails are never captured in screenshots or printed.