import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/format";
import { clearAllPromos, setItemAvailability, setItemPromo } from "../actions";
import { getRole } from "@/lib/auth";
import type { CategoryWithItems } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const isAdmin = (await getRole()) === "admin";
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, sort_order, menu_items(*)")
    .order("sort_order", { ascending: true })
    .order("sort_order", { referencedTable: "menu_items", ascending: true });

  if (error) throw new Error(error.message);
  const categories = (data ?? []) as CategoryWithItems[];
  const all = categories.flatMap((c) => c.menu_items);
  const soldOut = all.filter((i) => !i.is_available);
  const promoted = all.filter((i) => i.promo);

  return (
    <div className="mx-auto max-w-5xl p-4">
      <h1 className="mb-1 text-2xl font-bold">Мәзір және акциялар</h1>
      <p className="mb-4 text-sm text-neutral-500">
        «Бітті» деп белгілесең — қонақ мәзірінде «Бітіп қалды» деп шығады, оны тапсырыс етуге болмайды.
        «1+1» жарияласаң — әр төленген порцияға бір порция тегін беріледі.
      </p>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-100">
          <p className="text-sm text-neutral-500">Бітіп қалған тағамдар</p>
          <p className="text-2xl font-bold">{soldOut.length}</p>
          {soldOut.length > 0 && (
            <p className="mt-1 text-sm text-neutral-600">{soldOut.map((i) => i.name).join(", ")}</p>
          )}
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-100">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm text-neutral-500">Белсенді 1+1 акциялар</p>
              <p className="text-2xl font-bold">{promoted.length}</p>
            </div>
            {isAdmin && promoted.length > 0 && (
              <form action={clearAllPromos}>
                <button className="rounded-lg px-3 py-1.5 text-sm text-red-600 ring-1 ring-red-200">
                  Барлық акцияны тоқтату
                </button>
              </form>
            )}
          </div>
          {promoted.length > 0 && (
            <p className="mt-1 text-sm text-neutral-600">{promoted.map((i) => i.name).join(", ")}</p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {categories.map((c) => (
          <section key={c.id}>
            <h2 className="mb-2 text-lg font-bold">{c.name}</h2>
            <ul className="divide-y divide-neutral-100 overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-100">
              {c.menu_items.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-medium">
                      <span className={item.is_available ? "" : "text-neutral-400 line-through"}>{item.name}</span>
                      {item.promo && (
                        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                          {item.promo}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-neutral-500">{formatPrice(item.price)}</p>
                  </div>

                  {isAdmin && (
                    <form action={setItemPromo}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="promo" value={item.promo ? "" : "1+1"} />
                      <button
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                          item.promo ? "bg-rose-500 text-white" : "text-rose-600 ring-1 ring-rose-200"
                        }`}
                      >
                        {item.promo ? "🎁 1+1 ✓ тоқтату" : "🎁 1+1 жариялау"}
                      </button>
                    </form>
                  )}

                  <form action={setItemAvailability}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="available" value={item.is_available ? "false" : "true"} />
                    <button
                      title={item.is_available ? "Басса — «Бітті» болады" : "Басса — қайта «Бар» болады"}
                      className={`w-28 rounded-lg px-3 py-1.5 text-sm font-medium ${
                        item.is_available
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : "bg-neutral-900 text-white"
                      }`}
                    >
                      {item.is_available ? "✅ Бар" : "⛔ Бітті"}
                    </button>
                  </form>
                </li>
              ))}
              {c.menu_items.length === 0 && <li className="p-3 text-sm text-neutral-400">Бос</li>}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-6 text-xs text-neutral-400">
        Күйді ауыстыру үшін батырманы бас: «✅ Бар» → «⛔ Бітті» → «✅ Бар».
      </p>
    </div>
  );
}
