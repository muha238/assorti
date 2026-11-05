"use client";

import { useEffect, useState } from "react";
import { CategoryTabs } from "./CategoryTabs";
import { MenuItemCard } from "./MenuItemCard";
import { CartBar } from "@/components/cart/CartBar";
import { CartSheet } from "@/components/cart/CartSheet";
import type { CategoryWithItems } from "@/types";

type Props = {
  categories: CategoryWithItems[];
  initialTable: string;
  restaurantName: string;
};

export function MenuView({ categories, initialTable, restaurantName }: Props) {
  const [active, setActive] = useState<string | null>(categories[0]?.slug ?? null);
  const [cartOpen, setCartOpen] = useState(false);
  const promoItems = categories.flatMap((c) => c.menu_items).filter((i) => i.promo && i.is_available);

  // Скролл кезінде белсенді категорияны анықтау
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible[0]) setActive(visible[0].target.id.replace("cat-", ""));
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );
    categories.forEach((c) => {
      const el = document.getElementById(`cat-${c.slug}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [categories]);

  const scrollTo = (slug: string) => {
    setActive(slug);
    document.getElementById(`cat-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto min-h-dvh max-w-2xl pb-28">
      <header className="sticky top-0 z-20 bg-neutral-50/90 px-4 pt-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">{restaurantName}</h1>
          {initialTable && (
            <span className="rounded-full bg-white px-3 py-1 text-sm font-medium ring-1 ring-neutral-200">
              🪑 Үстел {initialTable}
            </span>
          )}
        </div>
        <CategoryTabs categories={categories} activeSlug={active} onSelect={scrollTo} />
      </header>

      <main className="space-y-8 px-4 pt-2">
        {promoItems.length > 0 && (
          <div className="rounded-2xl bg-gradient-to-r from-rose-500 to-orange-400 p-4 text-white shadow-sm">
            <p className="text-lg font-bold">🎁 Акция 1+1</p>
            <p className="text-sm text-white/90">1 алсаңыз — екіншісі тегін: {promoItems.map((i) => i.name).join(", ")}</p>
          </div>
        )}
        {categories.map((c) => (
          <section key={c.id} id={`cat-${c.slug}`} className="scroll-mt-32">
            <h2 className="mb-3 text-lg font-bold">{c.name}</h2>
            {c.menu_items.length === 0 ? (
              <p className="text-sm text-neutral-400">Әзірге бос</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {c.menu_items.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        ))}
      </main>

      <CartBar onOpen={() => setCartOpen(true)} />
      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} initialTable={initialTable} />
    </div>
  );
}
