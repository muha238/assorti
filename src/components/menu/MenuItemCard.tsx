"use client";

import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import { QuantityControl } from "@/components/ui/QuantityControl";
import { formatPrice } from "@/lib/format";
import type { MenuItem } from "@/types";
import { localizedText, useLanguage } from "@/components/i18n/LanguageProvider";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const { add, decrement, quantityOf } = useCart();
  const { language, t } = useLanguage();
  const qty = quantityOf(item.id);
  const soldOut = !item.is_available;
  const name = localizedText(language, item.name, item.name_ru);
  const description = localizedText(language, item.description ?? "", item.description_ru);

  return (
    <article
      className={`group flex gap-3 rounded-[1.35rem] bg-white p-3.5 shadow-[0_5px_20px_-14px_rgba(40,55,45,0.35)] ring-1 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-18px_rgba(40,55,45,0.4)] ${
        item.promo && !soldOut ? "ring-[#e9b08c]" : "ring-[#eee9df]"
      }`}
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1rem] bg-[#f3efe7] sm:h-28 sm:w-28">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={name}
            fill
            sizes="112px"
            className={`object-cover ${soldOut ? "opacity-50 grayscale" : ""}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">🥘</div>
        )}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-md bg-white/95 px-2 py-1 text-xs font-bold text-[#28372d]">{t("soldOut")}</span>
          </div>
        )}
        {item.promo && !soldOut && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-[#bd633b] px-2 py-0.5 text-xs font-bold text-white shadow">
            {item.promo}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className={`font-semibold leading-tight ${soldOut ? "text-[#aaa69c]" : "text-[#28372d]"}`}>
          {name}
        </h3>
        {description && (
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#85837a]">{description}</p>
        )}
        {item.promo === "1+1" && !soldOut && (
          <p className="mt-1 text-xs font-semibold text-[#b65e35]">🎁 {t("promoDescription")}!</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className={`font-bold ${soldOut ? "text-[#aaa69c]" : "text-[#28372d]"}`}>
            {formatPrice(item.price)}
          </span>
          {soldOut ? (
            <span className="rounded-full bg-[#f3efe7] px-3 py-1.5 text-xs font-semibold text-[#88857b]">
              {t("soldOutToday")}
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
              aria-label={`${t("addToCart")}: ${name}`}
              className="rounded-full bg-[#28372d] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#354a3c] active:scale-95"
            >
              + {t("add")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
