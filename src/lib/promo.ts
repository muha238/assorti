export const PROMOS = ["1+1"] as const;
export type Promo = (typeof PROMOS)[number];

export function isPromo(v: unknown): v is Promo {
  return typeof v === "string" && (PROMOS as readonly string[]).includes(v);
}

/** Қанша порция тегін беріледі. 1+1: әр төленген порцияға +1 тегін. */
export function freeQuantity(promo: Promo | null | undefined, paidQty: number): number {
  return promo === "1+1" ? paidQty : 0;
}
