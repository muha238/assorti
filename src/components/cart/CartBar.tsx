"use client";

import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/format";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function CartBar({ onOpen }: { onOpen: () => void }) {
  const { items, totalCount, totalPrice } = useCart();
  const { t } = useLanguage();
  if (items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={onOpen}
        className="mx-auto flex w-full max-w-4xl items-center justify-between rounded-2xl bg-[#28372d] px-5 py-4 text-white shadow-[0_12px_35px_-12px_rgba(40,55,45,0.65)] active:scale-[0.99]"
      >
        <span className="flex items-center gap-2 font-medium">
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-neutral-900">
            {totalCount}
          </span>
          {t("cart")}
        </span>
        <span className="font-bold">{formatPrice(totalPrice)}</span>
      </button>
    </div>
  );
}
