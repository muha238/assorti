import "server-only";
import { headers } from "next/headers";
import { roleFromAuthHeader, type Role } from "./auth-core";

export type { Role };

/** Ағымдағы сұраныстың рөлі (Basic Auth бойынша) */
export async function getRole(): Promise<Role | null> {
  const h = await headers();
  return roleFromAuthHeader(h.get("authorization"));
}

/**
 * Server action-дың ішінде МІНДЕТТІ түрде шақыр.
 * Middleware тек /admin жолын қорғайды, ал action-ды кез келген беттен шақыруға болады.
 */
export async function requireRole(...allowed: Role[]): Promise<Role> {
  const role = await getRole();
  if (!role || !allowed.includes(role)) throw new Error("Рұқсат жоқ");
  return role;
}
