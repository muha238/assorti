/**
 * Рөлдер және Basic Auth тексеру.
 * Edge (middleware) пен Node (server action) екеуінде де жұмыс істейді — node API жоқ.
 */
export type Role = "admin" | "cashier";

/** Уақыт бойынша ағып кетпейтін салыстыру (парольді таңбалап табуға кедергі) */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function decodeBasic(header: string | null): { user: string; pass: string } | null {
  if (!header?.startsWith("Basic ")) return null;
  try {
    const bytes = Uint8Array.from(atob(header.slice(6)), (c) => c.charCodeAt(0));
    const raw = new TextDecoder().decode(bytes);
    const i = raw.indexOf(":"); // парольде «:» болса да дұрыс бөлінеді
    if (i < 0) return null;
    return { user: raw.slice(0, i), pass: raw.slice(i + 1) };
  } catch {
    return null;
  }
}

/** Authorization header бойынша рөлді анықтау. Сәйкес келмесе — null. */
export function roleFromAuthHeader(header: string | null): Role | null {
  const cred = decodeBasic(header);
  if (!cred) return null;

  const accounts: [Role, string | undefined, string | undefined][] = [
    ["admin", process.env.ADMIN_USER, process.env.ADMIN_PASSWORD],
    ["cashier", process.env.CASHIER_USER, process.env.CASHIER_PASSWORD],
  ];
  for (const [role, user, pass] of accounts) {
    if (!user || !pass) continue;
    // екеуін де тексереміз (&& емес &) — қысқа тұйықталу уақыт айырмасын бермеуі үшін
    if (Number(safeEqual(cred.user, user)) & Number(safeEqual(cred.pass, pass))) return role;
  }
  return null;
}
