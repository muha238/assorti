"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import type { CreateOrderPayload } from "@/types";

type Props = {
  initialTable: string;
  onSuccess: (orderNumber: number) => void;
};

export function CheckoutForm({ initialTable, onSuccess }: Props) {
  const { items, clear } = useCart();
  const [table, setTable] = useState(initialTable);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!table.trim()) {
      setError("Үстел нөмірін енгізіңіз");
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
      if (!res.ok) throw new Error(data.error ?? "Қате шықты");
      clear();
      onSuccess(data.orderNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Қате шықты");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-t border-neutral-100 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-600">Үстел нөмірі</span>
        <input
          value={table}
          onChange={(e) => setTable(e.target.value)}
          inputMode="numeric"
          maxLength={10}
          placeholder="Мысалы: 7"
          className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-base outline-none focus:border-neutral-900"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-600">Түсініктеме (міндетті емес)</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Пиязсыз, ащы емес..."
          className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-base outline-none focus:border-neutral-900"
        />
      </label>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || items.length === 0}
        className="w-full rounded-2xl bg-neutral-900 py-3.5 font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Жіберілуде..." : "Тапсырыс беру"}
      </button>
    </form>
  );
}
