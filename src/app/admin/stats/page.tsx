import { formatPrice } from "@/lib/format";
import { isYMD, todayYMD } from "@/lib/date";
import { getDayStats } from "@/lib/stats";
import { getRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ date?: string }> };

export default async function AdminStatsPage({ searchParams }: Props) {
  if ((await getRole()) !== "admin") return <p className="p-4 text-neutral-500">Рұқсат жоқ</p>;
  const { date } = await searchParams;
  const today = todayYMD();
  const day = isYMD(date) ? date : today;
  const s = await getDayStats(day);
  const top = s.items[0];

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Күндік статистика</h1>
          <p className="text-sm text-neutral-500">
            {day === today ? "Бүгін" : day} · бас тартылған тапсырыстар есепке кірмейді
          </p>
        </div>
        {/* GET форма — JS-сіз жұмыс істейді */}
        <form className="flex gap-2">
          <input
            type="date"
            name="date"
            defaultValue={day}
            max={today}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2"
          />
          <button className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white">Көрсету</button>
        </form>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Tile label="💰 Табыс" value={formatPrice(s.revenue)} big />
        <Tile label="🧾 Тапсырыс саны" value={String(s.orders)} />
        <Tile label="🧮 Орташа чек" value={formatPrice(s.avgCheck)} />
        <Tile label="❌ Бас тартылған" value={String(s.cancelled)} />
      </div>

      {top ? (
        <div className="mb-6 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
          <p className="text-sm text-amber-800">🏆 Ең көп сатылған тағам</p>
          <p className="text-xl font-bold">{top.name}</p>
          <p className="text-sm text-amber-900">
            {top.paid + top.free} порция
            {top.free > 0 && ` (оның ${top.free}-і 1+1 бойынша тегін)`} · {formatPrice(top.revenue)}
          </p>
        </div>
      ) : (
        <p className="mb-6 text-neutral-500">Бұл күні сатылым болған жоқ.</p>
      )}

      {s.items.length > 0 && (
        <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-neutral-100">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Тағам</th>
                <th className="p-3 text-right">Порция</th>
                <th className="p-3 text-right">Оның ішінде тегін (1+1)</th>
                <th className="p-3 text-right">Табыс</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {s.items.map((i, idx) => (
                <tr key={i.name}>
                  <td className="p-3 text-neutral-400 tabular-nums">{idx + 1}</td>
                  <td className="p-3 font-medium">{i.name}</td>
                  <td className="p-3 text-right tabular-nums">{i.paid + i.free}</td>
                  <td className="p-3 text-right tabular-nums text-rose-600">{i.free || "—"}</td>
                  <td className="p-3 text-right tabular-nums">{formatPrice(i.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-neutral-100">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className={`font-bold tabular-nums ${big ? "text-3xl" : "text-2xl"}`}>{value}</p>
    </div>
  );
}
