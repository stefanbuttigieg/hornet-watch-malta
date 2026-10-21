/** UTC cron candidates cover both Malta offsets; only the local target hours run. */
export function isNewsRefreshTime(date: Date): boolean {
  const hour = Number(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Malta", hour: "2-digit", hourCycle: "h23",
  }).format(date));
  return hour === 8 || hour === 14;
}