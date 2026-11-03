import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/format";
import { updateOrderStatus } from "./actions";
import { AutoRefresh } from "./AutoRefresh";
import type { Order, OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "🆕 Жаңа",
  cooking: "👨‍🍳 Дайындалуда",
  ready: "✅ Дайын",
  served: "🍽 Берілді",
  cancelled: "❌ Бас тартылды",
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  new: "cooking",
  cooking: "ready",
  ready: "served",
};

export default async function AdminPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(id, name, price, quantity)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  const orders = (data ?? []) as Order[];

  return (
    <div className="mx-auto max-w-5xl p-4">
      <AutoRefresh seconds={15} />
      <h1 className="mb-4 text-2xl font-bold">Тапсырыстар</h1>

      {orders.length === 0 && <p className="text-neutral-500">Әзірге тапсырыс жоқ</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((o) => {
          const next = NEXT_STATUS[o.status];
          return (
            <div key={o.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold">#{o.order_number} · Үстел {o.table_number}</p>
                  <p className="text-xs text-neutral-400">
                    {new Date(o.created_at).toLocaleString("ru-RU", { timeZone: "Asia/Almaty" })}
                  </p>
                </div>
                <span className="text-sm">{STATUS_LABEL[o.status]}</span>
              </div>

              <ul className="my-3 space-y-1 text-sm">
                {o.order_items.map((i) => (
                  <li key={i.id} className="flex justify-between">
                    <span>{i.name} × {i.quantity}</span>
                    <span className="text-neutral-500">{formatPrice(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              {o.comment && <p className="mb-2 rounded-lg bg-amber-50 p-2 text-sm">💬 {o.comment}</p>}

              <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                <span className="font-bold">{formatPrice(o.total)}</span>
                <div className="flex gap-2">
                  {o.status !== "cancelled" && o.status !== "served" && (
                    <form action={updateOrderStatus}>
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="status" value="cancelled" />
                      <button className="rounded-lg px-3 py-1.5 text-sm text-red-600 ring-1 ring-red-200">Бас тарту</button>
                    </form>
                  )}
                  {next && (
                    <form action={updateOrderStatus}>
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="status" value={next} />
                      <button className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm text-white">
                        → {STATUS_LABEL[next]}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
