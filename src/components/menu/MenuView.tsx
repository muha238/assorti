"use client";

import { useEffect, useState } from "react";
import { CategoryTabs } from "./CategoryTabs";
import { MenuItemCard } from "./MenuItemCard";
import { CartBar } from "@/components/cart/CartBar";
import { CartSheet } from "@/components/cart/CartSheet";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { localizedText, useLanguage } from "@/components/i18n/LanguageProvider";
import type { CategoryWithItems } from "@/types";

type Props = {
  categories: CategoryWithItems[];
  initialTable: string;
  restaurantName: string;
};

export function MenuView({ categories, initialTable, restaurantName }: Props) {
  const [active, setActive] = useState<string | null>(categories[0]?.slug ?? null);
  const [cartOpen, setCartOpen] = useState(false);
  const { language, t } = useLanguage();
  const promoItems = categories.flatMap((c) => c.menu_items).filter((i) => i.promo && i.is_available);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible[0]) setActive(visible[0].target.id.replace("cat-", ""));
      },
      { rootMargin: "-145px 0px -60% 0px" },
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
    <div className="menu-shell mx-auto min-h-dvh max-w-5xl pb-32">
      <header className="sticky top-0 z-20 border-b border-[#e9e1d4]/80 bg-[#f7f4ed]/90 px-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex h-[68px] max-w-4xl items-center justify-between gap-3">
          <a href="#" className="flex min-w-0 items-center gap-2.5" aria-label={restaurantName}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#28372d] text-lg text-[#f4c18b]">
              D
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-extrabold tracking-[0.12em] text-[#28372d]">
                {restaurantName}
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a06b49]">
                {t("tagline")}
              </span>
            </span>
          </a>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {initialTable && (
              <span className="hidden items-center gap-1.5 rounded-full border border-[#e9e1d4] bg-white/70 px-3 py-2 text-xs font-semibold text-[#62665e] sm:flex">
                <span aria-hidden="true">⌂</span> {t("table")} {initialTable}
              </span>
            )}
            <LanguageToggle />
          </div>
        </div>
        <div className="mx-auto max-w-4xl">
          <CategoryTabs categories={categories} activeSlug={active} onSelect={scrollTo} />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-8">
        <section className="relative my-6 overflow-hidden rounded-[2rem] bg-[#28372d] px-6 py-8 text-white shadow-[0_18px_50px_-25px_rgba(40,55,45,0.55)] sm:my-9 sm:px-10 sm:py-11">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-1 top-5 h-44 w-44 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-16 right-16 h-40 w-40 rounded-full bg-[#c76f3d]/25 blur-2xl" />
          <div className="relative max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f4c18b]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f4c18b]" />
              Dala Cafe
            </span>
            <h1 className="mt-5 max-w-lg text-[2rem] font-semibold leading-[1.13] tracking-[-0.04em] sm:text-[2.8rem]">
              {t("welcome")}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/70 sm:text-base">
              {t("welcomeDescription")}
            </p>
            {initialTable && (
              <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium sm:hidden">
                <span aria-hidden="true">⌂</span> {t("table")} {initialTable}
              </span>
            )}
          </div>
          <div className="pointer-events-none absolute bottom-5 right-5 hidden rotate-[-12deg] text-8xl opacity-90 sm:block" aria-hidden="true">
            ☕
          </div>
        </section>

        <div className="mb-5 flex items-end justify-between px-1">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a06b49]">{t("tagline")}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#28372d]">{t("menu")}</h2>
          </div>
          {initialTable && (
            <span className="text-xs font-medium text-[#77766e] sm:hidden">{t("table")} {initialTable}</span>
          )}
        </div>

        <div className="space-y-9">
          {promoItems.length > 0 && (
            <aside className="relative overflow-hidden rounded-3xl bg-[#f1e4d4] p-5 sm:p-6">
              <div className="absolute -right-5 -top-8 h-32 w-32 rounded-full bg-[#e6c6a9]/50" />
              <div className="relative flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">🎁</span>
                <div className="min-w-0">
                  <p className="font-bold text-[#714326]">{t("promoTitle")}</p>
                  <p className="mt-1 text-sm leading-5 text-[#82674f]">
                    {t("promoDescription")}:{" "}
                    {promoItems.map((i) => localizedText(language, i.name, i.name_ru)).join(", ")}
                  </p>
                </div>
                <span className="ml-auto hidden shrink-0 rounded-full bg-white/75 px-3 py-1 text-xs font-extrabold text-[#b05c31] sm:block">
                  1 + 1
                </span>
              </div>
            </aside>
          )}

          {categories.map((category) => (
            <section key={category.id} id={`cat-${category.slug}`} className="scroll-mt-36">
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight text-[#28372d]">
                  {localizedText(language, category.name, category.name_ru)}
                </h2>
                <span className="h-px flex-1 bg-[#e8e1d5]" />
                <span className="text-xs font-medium text-[#a09a8e]">{category.menu_items.length}</span>
              </div>
              {category.menu_items.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#ded6c9] px-4 py-7 text-center text-sm text-[#999387]">
                  {t("emptyCategory")}
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {category.menu_items.map((item) => <MenuItemCard key={item.id} item={item} />)}
                </div>
              )}
            </section>
          ))}
        </div>
      </main>

      <CartBar onOpen={() => setCartOpen(true)} />
      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} initialTable={initialTable} />
    </div>
  );
}
