"use client";

import type { Category } from "@/types";
import { localizedText, useLanguage } from "@/components/i18n/LanguageProvider";

type Props = {
  categories: Category[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
};

export function CategoryTabs({ categories, activeSlug, onSelect }: Props) {
  const { language, t } = useLanguage();
  return (
    <nav
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-2.5 sm:mx-0 sm:px-0"
      aria-label={t("menu")}
    >
      {categories.map((c) => {
        const active = c.slug === activeSlug;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.slug)}
            className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
              active ? "bg-[#28372d] text-white shadow-sm" : "bg-white/70 text-[#676a62] ring-1 ring-[#e9e1d4] hover:bg-white"
            }`}
          >
            {localizedText(language, c.name, c.name_ru)}
          </button>
        );
      })}
    </nav>
  );
}
