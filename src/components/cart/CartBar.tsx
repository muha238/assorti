"use client";

import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/format";

export function CartBar({ onOpen }: { onOpen: () => void }) {
  const { totalCount, totalPrice } = useCart();
  if (totalCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={onOpen}
        className="mx-auto flex w-full max-w-2xl items-center justify-between rounded-2xl bg-neutral-900 px-5 py-4 text-white shadow-xl active:scale-[0.99]"
      >
        <span className="flex items-center gap-2 font-medium">
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-neutral-900">
            {totalCount}
          </span>
          Себет
        </span>
        <span className="font-bold">{formatPrice(totalPrice)}</span>
      </button>
    </div>
  );
}
