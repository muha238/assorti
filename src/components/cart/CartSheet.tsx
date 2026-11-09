"use client";

import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import { CheckoutForm } from "./CheckoutForm";
import { QuantityControl } from "@/components/ui/QuantityControl";
import { formatPrice } from "@/lib/format";
import { localizedText, useLanguage } from "@/components/i18n/LanguageProvider";

type Props = {
  open: boolean;
  onClose: () => void;
  initialTable: string;
};

export function CartSheet({ open, onClose, initialTable }: Props) {
  const { items, totalPrice, add, decrement, remove } = useCart();
  const { language, t } = useLanguage();
  const [success, setSuccess] = useState<number | null>(null);

  // Ашық кезде фондағы скроллды бұғаттау
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const close = () => {
    setSuccess(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={close} />

      <div className="relative flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-3xl bg-[#fffefa] sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-[#eee9df] px-5 py-4">
          <h2 className="text-lg font-bold text-[#28372d]">{success ? t("done") : t("checkoutTitle")}</h2>
          <button type="button" onClick={close} aria-label={t("close")} className="text-2xl leading-none text-[#999387]">
            ×
          </button>
        </div>

        {success !== null ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div className="text-5xl">✅</div>
            <p className="text-xl font-bold text-[#28372d]">#{success} {t("orderAccepted")}</p>
            <p className="text-[#77766e]">{t("waiterComing")}</p>
            <button
              type="button"
              onClick={close}
              className="mt-4 w-full rounded-2xl bg-[#28372d] py-3.5 font-semibold text-white"
            >
              {t("backToMenu")}
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="px-6 py-10 text-center text-[#77766e]">{t("emptyCart")} 🛒</p>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <ul className="divide-y divide-[#eee9df] px-5">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-medium ${i.available ? "" : "text-neutral-400 line-through"}`}>
                      {localizedText(language, i.name, i.name_ru)}
                    </p>
                    {i.available ? (
                      <p className="text-sm text-neutral-500">
                        {formatPrice(i.price * i.quantity)}
                        {i.free > 0 && (
                          <span className="ml-2 font-semibold text-[#b65e35]">🎁 +{i.free} {t("free")}</span>
                        )}
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-[#b54536]">{t("removeUnavailable")}</p>
                    )}
                  </div>
                  {i.available && (
                    <QuantityControl
                      size="sm"
                      quantity={i.quantity}
                      onIncrement={() => add(i)}
                      onDecrement={() => decrement(i.id)}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => remove(i.id)}
                    aria-label={t("remove")}
                    className="text-[#c0b9ad] hover:text-[#b54536]"
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between px-5 py-3 text-lg font-bold">
              <span>{t("total")}</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>

            <CheckoutForm initialTable={initialTable} onSuccess={setSuccess} />
          </div>
        )}
      </div>
    </div>
  );
}
