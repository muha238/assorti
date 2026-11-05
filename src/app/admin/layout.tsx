import Link from "next/link";
import { getRole, type Role } from "@/lib/auth";

const LINKS: { href: string; label: string; roles: Role[] }[] = [
  { href: "/admin", label: "🧾 Тапсырыстар", roles: ["admin", "cashier"] },
  { href: "/admin/menu", label: "🍽 Мәзір / Акция", roles: ["admin", "cashier"] },
  { href: "/admin/stats", label: "📊 Статистика", roles: ["admin"] },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const role = await getRole();
  return (
    <div className="min-h-dvh">
      <nav className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="no-scrollbar mx-auto flex max-w-5xl gap-2 overflow-x-auto p-3">
          {LINKS.filter((l) => role && l.roles.includes(role)).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="shrink-0 rounded-full px-4 py-2 text-sm font-medium ring-1 ring-neutral-200 hover:bg-neutral-100"
            >
              {l.label}
            </Link>
          ))}
          <span className="ml-auto shrink-0 self-center text-xs text-neutral-400">
            {role === "admin" ? "👑 Әкімші" : "💳 Кассир"}
          </span>
        </div>
      </nav>
      {children}
    </div>
  );
}
