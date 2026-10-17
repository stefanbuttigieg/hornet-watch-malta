// Asks OpenStreetMap (Nominatim) whether a point is on land. Sea points return an error.
// Returns true (land), false (sea) or null (couldn't check — don't block the reporter).
export async function isOnLand(lat: number, lng: number): Promise<boolean | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=16&lat=${lat}&lon=${lng}`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const j = (await res.json()) as { error?: string; addresstype?: string; address?: Record<string, string> };
    if (j.error) return false;
    // Points in Maltese waters only resolve to the country itself (no town, road, etc.).
    if (j.addresstype === "country" || j.address?.["country_code"] !== "mt") return false;
    return Object.keys(j.address ?? {}).some((k) => !["country", "country_code"].includes(k));
  } catch {
    return null;
  }
}
