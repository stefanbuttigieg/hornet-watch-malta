/** Minimum time a real person needs to fill in the report form. */
export const MIN_FILL_MS = 3000;

/** True when the hidden trap field was filled or the form was sent implausibly fast. */
export function isLikelyBot(trapValue: string, elapsedMs: number): boolean {
  return trapValue.trim() !== "" || elapsedMs < MIN_FILL_MS;
}
