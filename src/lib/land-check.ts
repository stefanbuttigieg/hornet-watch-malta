// Asks OpenStreetMap (Nominatim) whether a point is on land. Sea points return an error.
// Returns true (land), false (sea) or null (couldn't check — don't block the reporter).
export async function isOnLand(lat: number, lng: number): Promise<boolean | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=16&lat=${lat}&lon=${lng}`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const j = (await res.json()) as { error?: string; address?: { country_code?: string } };
    if (j.error) return false;
    return j.address?.country_code === "mt";
  } catch {
    return null;
  }
}
