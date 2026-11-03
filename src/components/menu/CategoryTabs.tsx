"use client";

import type { Category } from "@/types";

type Props = {
  categories: Category[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
};

export function CategoryTabs({ categories, activeSlug, onSelect }: Props) {
  return (
    <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-3">
      {categories.map((c) => {
        const active = c.slug === activeSlug;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.slug)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200"
            }`}
          >
            {c.name}
          </button>
        );
      })}
    </nav>
  );
}
