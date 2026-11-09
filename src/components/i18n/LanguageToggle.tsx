"use client";

import { useLanguage } from "./LanguageProvider";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="flex items-center rounded-full border border-[#e9e1d4] bg-white/80 p-1 shadow-sm"
      aria-label="Тілді таңдау / Выбор языка"
    >
      {(["kk", "ru"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setLanguage(value)}
          aria-pressed={language === value}
          className={`min-w-10 rounded-full px-3 py-1.5 text-xs font-bold tracking-wide transition ${
            language === value
              ? "bg-[#28372d] text-white shadow-sm"
              : "text-[#77766e] hover:text-[#28372d]"
          }`}
        >
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
