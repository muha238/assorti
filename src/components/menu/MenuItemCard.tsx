"use client";

import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import { QuantityControl } from "@/components/ui/QuantityControl";
import { formatPrice } from "@/lib/format";
import type { MenuItem } from "@/types";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const { add, decrement, quantityOf } = useCart();
  const qty = quantityOf(item.id);
  const soldOut = !item.is_available;

  return (
    <article
      className={`flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ${
        item.promo && !soldOut ? "ring-rose-200" : "ring-neutral-100"
      }`}
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-28 sm:w-28">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="112px"
            className={`object-cover ${soldOut ? "opacity-50 grayscale" : ""}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">🍽️</div>
        )}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-md bg-white/95 px-2 py-1 text-xs font-bold text-neutral-900">Бітіп қалды</span>
          </div>
        )}
        {item.promo && !soldOut && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white shadow">
            {item.promo}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className={`font-semibold leading-tight ${soldOut ? "text-neutral-400" : "text-neutral-900"}`}>
          {item.name}
        </h3>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{item.description}</p>
        )}
        {item.promo === "1+1" && !soldOut && (
          <p className="mt-1 text-xs font-semibold text-rose-600">🎁 Акция: 1 алсаңыз — 1 тегін!</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className={`font-bold ${soldOut ? "text-neutral-400" : "text-neutral-900"}`}>
            {formatPrice(item.price)}
          </span>
          {soldOut ? (
            <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-500">
              Бүгінге бітті
            </span>
          ) : qty > 0 ? (
            <QuantityControl
              size="sm"
              quantity={qty}
              onIncrement={() => add(item)}
              onDecrement={() => decrement(item.id)}
            />
          ) : (
            <button
              type="button"
              onClick={() => add(item)}
              className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white active:scale-95"
            >
              + Қосу
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
