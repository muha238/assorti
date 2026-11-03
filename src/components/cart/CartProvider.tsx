"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, MenuItem } from "@/types";

type CartContextValue = {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
  add: (item: Pick<MenuItem, "id" | "name" | "price" | "image_url">) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  quantityOf: (id: string) => number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "qr-menu-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // localStorage-тан қалпына келтіру (бет жаңарса да себет сақталады)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((m: Pick<MenuItem, "id" | "name" | "price" | "image_url">) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === m.id);
      if (found) return prev.map((i) => (i.id === m.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { id: m.id, name: m.name, price: m.price, image_url: m.image_url, quantity: 1 }];
    });
  }, []);

  const decrement = useCallback((id: string) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const totalCount = items.reduce((s, i) => s + i.quantity, 0);
    const totalPrice = items.reduce((s, i) => s + i.quantity * i.price, 0);
    return {
      items,
      totalCount,
      totalPrice,
      add,
      decrement,
      remove,
      clear,
      quantityOf: (id) => items.find((i) => i.id === id)?.quantity ?? 0,
    };
  }, [items, add, decrement, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
