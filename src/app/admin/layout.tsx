import Link from "next/link";

const LINKS = [
  { href: "/admin", label: "🧾 Тапсырыстар" },
  { href: "/admin/menu", label: "🍽 Мәзір / Акция" },
  { href: "/admin/stats", label: "📊 Статистика" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <nav className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="no-scrollbar mx-auto flex max-w-5xl gap-2 overflow-x-auto p-3">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="shrink-0 rounded-full px-4 py-2 text-sm font-medium ring-1 ring-neutral-200 hover:bg-neutral-100"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
      {children}
    </div>
  );
}
