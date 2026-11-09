"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import type { CreateOrderPayload } from "@/types";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type Props = {
  initialTable: string;
  onSuccess: (orderNumber: number) => void;
};

export function CheckoutForm({ initialTable, onSuccess }: Props) {
  const { items, clear, hasSoldOut } = useCart();
  const { t } = useLanguage();
  const [table, setTable] = useState(initialTable);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!table.trim()) {
      setError(t("enterTable"));
      return;
    }
    setLoading(true);
    setError(null);

    const payload: CreateOrderPayload = {
      tableNumber: table.trim(),
      comment: comment.trim() || undefined,
      items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("requestFailed"));
      clear();
      onSuccess(data.orderNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("requestFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-t border-[#eee9df] px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#62665e]">{t("tableNumber")}</span>
        <input
          value={table}
          onChange={(e) => setTable(e.target.value)}
          inputMode="numeric"
          maxLength={10}
          placeholder={t("tablePlaceholder")}
          className="w-full rounded-xl border border-[#e5ded2] bg-white px-4 py-3 text-base outline-none focus:border-[#657a68]"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#62665e]">{t("comment")} ({t("optional")})</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder={t("commentPlaceholder")}
          className="w-full resize-none rounded-xl border border-[#e5ded2] bg-white px-4 py-3 text-base outline-none focus:border-[#657a68]"
        />
      </label>

      {hasSoldOut && (
        <p className="rounded-lg bg-red-50 p-2 text-sm font-medium text-red-600">
          {t("soldOutInCart")} 🗑
        </p>
      )}
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || items.length === 0 || hasSoldOut}
        className="w-full rounded-2xl bg-[#28372d] py-3.5 font-semibold text-white disabled:opacity-50"
      >
        {loading ? t("sending") : t("placeOrder")}
      </button>
    </form>
  );
}
