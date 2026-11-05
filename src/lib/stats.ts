import "server-only";
import { createAdminClient } from "./supabase/admin";
import { dayRange } from "./date";

export type ItemStat = {
  name: string;
  /** Төленген порциялар */
  paid: number;
  /** 1+1 бойынша тегін берілген порциялар */
  free: number;
  revenue: number;
};

export type DayStats = {
  revenue: number;
  orders: number;
  cancelled: number;
  avgCheck: number;
  items: ItemStat[]; // ең көп сатылғаны бірінші
};

/** Бір күннің статистикасы (Алматы уақытымен). Бас тартылған тапсырыстар табысқа кірмейді. */
export async function getDayStats(ymd: string): Promise<DayStats> {
  const { from, to } = dayRange(ymd);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("total, status, order_items(name, price, quantity, free_quantity)")
    .gte("created_at", from)
    .lt("created_at", to)
    .limit(5000);

  if (error) throw new Error(error.message);

  type Row = {
    total: number;
    status: string;
    order_items: { name: string; price: number; quantity: number; free_quantity: number | null }[];
  };
  const rows = (data ?? []) as Row[];
  const active = rows.filter((r) => r.status !== "cancelled");

  const byName = new Map<string, ItemStat>();
  for (const o of active) {
    for (const i of o.order_items) {
      const s = byName.get(i.name) ?? { name: i.name, paid: 0, free: 0, revenue: 0 };
      s.paid += i.quantity;
      s.free += i.free_quantity ?? 0;
      s.revenue += i.price * i.quantity;
      byName.set(i.name, s);
    }
  }

  const revenue = active.reduce((s, o) => s + o.total, 0);
  return {
    revenue,
    orders: active.length,
    cancelled: rows.length - active.length,
    avgCheck: active.length ? Math.round(revenue / active.length) : 0,
    items: [...byName.values()].sort(
      (a, b) => b.paid + b.free - (a.paid + a.free) || b.revenue - a.revenue,
    ),
  };
}
