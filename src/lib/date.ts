export const TZ = "Asia/Almaty";

/** Бүгінгі күн (Алматы уақытымен) — "YYYY-MM-DD" */
export function todayYMD(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

export function isYMD(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

function tzOffset(ymd: string): string {
  const noon = new Date(`${ymd}T12:00:00Z`);
  const part = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "longOffset" })
    .formatToParts(noon)
    .find((p) => p.type === "timeZoneName")?.value;
  const off = part?.replace("GMT", "");
  return off || "+00:00";
}

/** Берілген күннің басы мен келесі күннің басы (ISO, UTC) — Алматы уақытымен */
export function dayRange(ymd: string): { from: string; to: string } {
  const from = new Date(`${ymd}T00:00:00${tzOffset(ymd)}`);
  const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}
