"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { freeQuantity } from "@/lib/promo";
import type { CartItem, MenuItem } from "@/types";
import type { Promo } from "@/lib/promo";

/** Себеттегі позиция + мәзірдің ағымдағы күйі (бітті ме, акция бар ма) */
export type CartLine = CartItem & {
  available: boolean;
  promo: Promo | null;
  /** 1+1 бойынша тегін порциялар */
  free: number;
};

type CartContextValue = {
  items: CartLine[];
  totalCount: number;
  totalPrice: number;
  /** Себетте бітіп қалған тағам бар ма */
  hasSoldOut: boolean;
  add: (item: Pick<MenuItem, "id" | "name" | "name_ru" | "price" | "image_url">) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  quantityOf: (id: string) => number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "qr-menu-cart";

type Props = {
  children: React.ReactNode;
  /** Сервердегі ағымдағы мәзір — баға/қолжетімділік/акция осыдан алынады */
  menuItems: MenuItem[];
};

export function CartProvider({ children, menuItems }: Props) {
  const [stored, setStored] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // localStorage-тан қалпына келтіру (бет жаңарса да себет сақталады)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStored(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }, [stored, hydrated]);

  const menuById = useMemo(() => new Map(menuItems.map((m) => [m.id, m])), [menuItems]);

  const add = useCallback(
    (m: Pick<MenuItem, "id" | "name" | "name_ru" | "price" | "image_url">) => {
      const current = menuById.get(m.id);
      if (current && !current.is_available) return; // бітіп қалғанын қоспаймыз
      setStored((prev) => {
        const found = prev.find((i) => i.id === m.id);
        if (found) return prev.map((i) => (i.id === m.id ? { ...i, quantity: i.quantity + 1 } : i));
        return [
          ...prev,
          { id: m.id, name: m.name, name_ru: m.name_ru, price: m.price, image_url: m.image_url, quantity: 1 },
        ];
      });
    },
    [menuById],
  );

  const decrement = useCallback((id: string) => {
    setStored((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const remove = useCallback((id: string) => setStored((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setStored([]), []);

  const value = useMemo<CartContextValue>(() => {
    const items: CartLine[] = stored.map((i) => {
      const m = menuById.get(i.id);
      const available = !!m && m.is_available;
      const promo = m?.promo ?? null;
      return {
        ...i,
        name: m?.name ?? i.name,
        name_ru: m?.name_ru ?? i.name_ru,
        price: m?.price ?? i.price,
        available,
        promo,
        free: available ? freeQuantity(promo, i.quantity) : 0,
      };
    });
    const ok = items.filter((i) => i.available);
    return {
      items,
      totalCount: ok.reduce((s, i) => s + i.quantity, 0),
      totalPrice: ok.reduce((s, i) => s + i.quantity * i.price, 0),
      hasSoldOut: ok.length !== items.length,
      add,
      decrement,
      remove,
      clear,
      quantityOf: (id) => stored.find((i) => i.id === id)?.quantity ?? 0,
    };
  }, [stored, menuById, add, decrement, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
