"""Real browser/storage regression tests; external geocoding alone is stubbed."""

import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import time
import unittest
from urllib.parse import urlparse
import uuid

from playwright.sync_api import sync_playwright, expect


BASE_URL = os.environ.get("E2E_BASE_URL", "http://localhost:8080").rstrip("/")
SCREENSHOTS = Path("/tmp/browser/report-safety")
LAND = (35.8658, 14.5119)  # Tarxien
SEA = (35.90, 14.58)  # Off Malta's east coast, inside the allowed bounding box


def database(sql):
    result = subprocess.run(
        ["psql", "-X", "-qAt", "-v", "ON_ERROR_STOP=1", "-c", sql],
        capture_output=True, text=True, check=False,
    )
    if result.returncode:
        raise AssertionError("Test database operation failed (details suppressed for privacy)")
    return result.stdout.strip()


class ReportSafetyE2E(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        for name in ("MODERATOR_PASSCODE", "PGHOST", "PGDATABASE", "PGUSER"):
            if not os.environ.get(name):
                raise RuntimeError(f"Required test environment variable is missing: {name}")
        if not shutil.which("psql"):
            raise RuntimeError("psql is required for narrowly scoped test cleanup")
        SCREENSHOTS.mkdir(parents=True, exist_ok=True)
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.context = self.browser.new_context(viewport={"width": 1280, "height": 1800})
        self.page = self.context.new_page()
        self.context.on("dialog", lambda dialog: dialog.accept())
        self.ids = set()
        self.marker = f"E2E-report-safety-{uuid.uuid4()}"
        self.email = f"report-safety-{uuid.uuid4()}@example.com"
        self.report_posts = 0
        self.geocode_mode = "land"
        self.context.route("https://nominatim.openstreetmap.org/reverse?*", self.geocode)
        self.page.on("request", self.track_report)
        self.addCleanup(self.cleanup)

    def cleanup(self):
        try:
            for report_id in self.ids:
                # UUID validation makes interpolation safe; timestamp matches only this insert.
                report_id = str(uuid.UUID(report_id))
                database(f"""
                    BEGIN;
                    DELETE FROM public.report_submissions WHERE created_at IN
                      (SELECT created_at FROM public.reports WHERE id = '{report_id}');
                    DELETE FROM public.reports WHERE id = '{report_id}';
                    COMMIT;
                """)
                self.assertEqual(database(f"SELECT count(*) FROM public.report_contacts WHERE report_id = '{report_id}'"), "0")
        finally:
            self.context.close()

    def track_report(self, request):
        if request.method == "POST" and urlparse(request.url).path == "/rest/v1/reports":
            self.report_posts += 1
            payload = request.post_data_json
            for row in payload if isinstance(payload, list) else [payload]:
                if row.get("notes", "").startswith(self.marker):
                    self.ids.add(str(uuid.UUID(row["id"])))

    def geocode(self, route):
        if self.geocode_mode == "sea-error":
            body = {"error": "Unable to geocode"}
        elif self.geocode_mode == "sea-country":
            body = {"addresstype": "country", "address": {"country": "Malta", "country_code": "mt"}}
        else:
            body = {"addresstype": "road", "address": {"road": "Tarxien", "country_code": "mt"}}
        route.fulfill(status=200, content_type="application/json", body=json.dumps(body))

    def open_form(self):
        self.page.goto(f"{BASE_URL}/report", wait_until="networkidle")
        expect(self.page.locator(".leaflet-container")).to_be_visible()
        self.opened = time.monotonic()

    def pick(self, point):
        # Leaflet's initial centre/zoom; use a real pointer click, not an internal callback.
        def project(lat, lng):
            sine = math.sin(math.radians(lat))
            return ((lng + 180) / 360 * 256 * 2**11,
                    (0.5 - math.log((1 + sine) / (1 - sine)) / (4 * math.pi)) * 256 * 2**11)
        x, y = project(*point)
        cx, cy = project(35.92, 14.4)
        box = self.page.locator(".leaflet-container").bounding_box()
        self.assertIsNotNone(box)
        self.page.locator(".leaflet-container").click(position={
            "x": box["width"] / 2 + x - cx, "y": box["height"] / 2 + y - cy,
        })

    def wait_human(self):
        self.page.wait_for_timeout(max(0, 3200 - (time.monotonic() - self.opened) * 1000))

    def test_sea_locations_are_rejected(self):
        self.open_form()
        for mode in ("sea-error", "sea-country"):
            with self.subTest(geocoder_response=mode):
                self.geocode_mode = mode
                self.pick(SEA)
                expect(self.page.get_by_text("That spot is in the sea — please tap on land", exact=True).first).to_be_visible()
                expect(self.page.locator(".leaflet-marker-icon")).to_have_count(0)
                self.assertEqual(self.page.get_by_label("Locality", exact=True).input_value(), "")
                self.wait_human()
                self.page.get_by_role("button", name="Submit report", exact=True).click()
                expect(self.page.get_by_text("Tap the map or use your location first", exact=True).first).to_be_visible()
                self.assertEqual(self.report_posts, 0, "A sea-only form must not send a report insert")
        self.page.screenshot(path=str(SCREENSHOTS / "sea-rejected.png"))
        self.geocode_mode = "land"
        self.pick(LAND)
        expect(self.page.get_by_text("Pinned near Tarxien", exact=True)).to_be_visible()
        expect(self.page.locator(".leaflet-marker-icon")).to_have_count(1)
        pin = self.page.locator(".leaflet-marker-icon").get_attribute("style")
        self.geocode_mode = "sea-error"
        self.pick(SEA)
        expect(self.page.get_by_text("That spot is in the sea — please tap on land", exact=True).first).to_be_visible()
        self.assertEqual(self.page.locator(".leaflet-marker-icon").get_attribute("style"), pin)
        self.assertEqual(self.page.get_by_label("Locality", exact=True).input_value(), "Tarxien")

    def submit_report(self, suffix, email=None):
        self.open_form()
        self.pick(LAND)
        expect(self.page.get_by_text("Pinned near Tarxien", exact=True)).to_be_visible()
        notes = f"{self.marker}-{suffix}"
        self.page.get_by_label("Notes", exact=True).fill(notes)
        self.page.get_by_label("How many hornets?", exact=True).fill("1")
        if email:
            self.page.get_by_label("Email (optional)", exact=True).fill(email)
        self.wait_human()
        with self.page.expect_response(lambda response:
                urlparse(response.url).path == "/rest/v1/reports" and response.request.method == "POST") as saved:
            self.page.get_by_role("button", name="Submit report", exact=True).click()
        self.assertTrue(saved.value.ok, "Real report insertion must succeed")
        self.page.wait_for_url(f"{BASE_URL}/", timeout=20000)
        report_id = database(f"SELECT id FROM public.reports WHERE notes = '{notes}'")
        self.assertIn(report_id, self.ids)
        return report_id, notes

    def assert_email_absent(self, value):
        # Do not include actual page/response contents in failure output.
        self.assertNotIn(self.email, value, "Reporter email leaked into a public surface")
        if isinstance(value, str):
            self.assertFalse(any(key in value for key in ('"contact_email"', '"email"')),
                             "Public data unexpectedly contains email fields")

    def test_optional_email_is_visible_only_in_moderation(self):
        with_email, notes = self.submit_report("with-email", self.email)
        without_email, no_email_notes = self.submit_report("without-email")
        self.assertEqual(database(f"SELECT count(*) FROM public.report_contacts WHERE report_id = '{with_email}'"), "1")
        self.assertEqual(database(f"SELECT count(*) FROM public.report_contacts WHERE report_id = '{without_email}'"), "0")

        self.page.goto(f"{BASE_URL}/moderate", wait_until="networkidle")
        self.assert_email_absent(self.page.content())
        self.page.get_by_placeholder("Moderator passcode").fill("invalid-e2e-passcode")
        self.page.get_by_role("button", name="Open", exact=True).click()
        expect(self.page.get_by_text("Wrong passcode", exact=True).first).to_be_visible()
        self.assert_email_absent(self.page.content())
        self.page.get_by_placeholder("Moderator passcode").fill(os.environ["MODERATOR_PASSCODE"])
        self.page.get_by_role("button", name="Open", exact=True).click()
        emailed_row = self.page.locator("li").filter(has_text=notes)
        expect(emailed_row).to_be_visible()
        contact = emailed_row.get_by_role("link", name=f"Ask reporter: {self.email}")
        expect(contact).to_be_visible()
        self.assertTrue(contact.get_attribute("href").startswith(f"mailto:{self.email}?subject="))
        blank_row = self.page.locator("li").filter(has_text=no_email_notes)
        expect(blank_row).to_be_visible()
        expect(blank_row.locator('a[href^="mailto:"]')).to_have_count(0)
        # Approve only our own fixtures if the existing near-location rule held them.
        for row in (emailed_row, blank_row):
            approve = row.get_by_role("button", name="Approve", exact=True)
            if approve.count():
                approve.click()
                expect(row.get_by_role("button", name="Approve", exact=True)).to_have_count(0)

        # A fresh anonymous browser must not inherit moderator state.
        public = self.browser.new_context(viewport={"width": 1280, "height": 1800})
        self.addCleanup(public.close)
        page = public.new_page()
        public_payloads = []
        page.on("response", lambda response: public_payloads.append(response)
                if "/rest/v1/" in response.url else None)
        page.goto(f"{BASE_URL}/", wait_until="networkidle")
        page.get_by_label("Date range").select_option("3650")
        expect(page.locator(".leaflet-interactive").first).to_be_visible()
        found = False
        for pin in page.locator("path.leaflet-interactive").all():
            pin.click(force=True)
            popup = page.locator(".leaflet-popup-content")
            if popup.count() and notes in popup.inner_text():
                self.assert_email_absent(popup.inner_text())
                self.assert_email_absent(page.content())
                popup.screenshot(path=str(SCREENSHOTS / "public-report-no-email.png"))
                found = True
                break
        self.assertTrue(found, "The newly saved report must read back through its public map popup")

        response = public.request.get(f"{BASE_URL}/api/public/v1/reports?limit=5000")
        self.assertTrue(response.ok, "Public reports API must succeed")
        api_body = response.text()
        self.assertIn(with_email, api_body, "Privacy check must include the actual saved report")
        self.assert_email_absent(api_body)

        # Direct anonymous contact reads must fail, not merely be hidden by the UI.
        report_response = next((r for r in public_payloads if "/rest/v1/reports?" in r.url), None)
        self.assertIsNotNone(report_response, "Public map must read real report data")
        headers = report_response.request.all_headers()
        contact_url = report_response.url.split("/rest/v1/")[0] + "/rest/v1/report_contacts?select=*"
        denied = public.request.get(contact_url, headers={
            k: v for k, v in headers.items() if k in ("apikey", "authorization")
        })
        self.assertIn(denied.status, (401, 403), "Anonymous readers must not have contact-table access")
        for response in public_payloads:
            if response.ok:
                self.assert_email_absent(response.text())

        page.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
        with page.expect_download() as downloaded:
            page.get_by_role("button", name="Export CSV").click()
        csv = Path(downloaded.value.path()).read_text()
        self.assertIn(with_email, csv, "CSV privacy check must include the saved report")
        self.assert_email_absent(csv)
        self.assertNotIn("email", csv.splitlines()[0].lower())

        for path in ("/", "/dashboard", "/report", "/about", "/news", "/privacy", "/cookies",
                     "/terms", "/accessibility", "/credits", "/data-request", "/donate", "/moderate"):
            page.goto(f"{BASE_URL}{path}", wait_until="networkidle")
            self.assert_email_absent(page.content())


if __name__ == "__main__":
    unittest.main(verbosity=2)