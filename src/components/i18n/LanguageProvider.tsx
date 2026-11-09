"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Language = "kk" | "ru";

const translations = {
  kk: {
    tagline: "Дәмге толы сәт",
    welcome: "Жақсы дәм — жақсы көңіл күйден басталады",
    welcomeDescription: "Өзіңізге ұнағанын таңдаңыз, қалғанын біз дайындаймыз.",
    menu: "Мәзір",
    table: "Үстел",
    promoTitle: "Сізге арнайы ұсыныс",
    promoDescription: "1 алсаңыз — екіншісі тегін",
    emptyCategory: "Әзірге тағам жоқ",
    soldOut: "Бітіп қалды",
    soldOutToday: "Бүгінге бітті",
    add: "Қосу",
    addToCart: "Себетке қосу",
    cart: "Себет",
    checkoutTitle: "Сіздің тапсырысыңыз",
    done: "Дайын!",
    close: "Жабу",
    orderAccepted: "тапсырыс қабылданды",
    waiterComing: "Даяшы жақын арада келеді. Ас болсын!",
    backToMenu: "Мәзірге оралу",
    emptyCart: "Себет бос",
    remove: "Алып тастау",
    removeUnavailable: "Бітіп қалды — алып тастаңыз",
    free: "тегін",
    total: "Барлығы",
    tableNumber: "Үстел нөмірі",
    tablePlaceholder: "Мысалы: 7",
    comment: "Түсініктеме",
    optional: "міндетті емес",
    commentPlaceholder: "Пиязсыз, ащы емес...",
    soldOutInCart: "Себетте бітіп қалған тағам бар. Оны алып тастаңыз",
    enterTable: "Үстел нөмірін енгізіңіз",
    requestFailed: "Қате шықты",
    sending: "Жіберілуде...",
    placeOrder: "Тапсырыс беру",
    decrease: "Азайту",
    increase: "Көбейту",
  },
  ru: {
    tagline: "Моменты со вкусом",
    welcome: "Хорошее настроение начинается с хорошей еды",
    welcomeDescription: "Выбирайте любимое — остальное мы приготовим.",
    menu: "Меню",
    table: "Стол",
    promoTitle: "Специальное предложение",
    promoDescription: "Берёте одно — второе бесплатно",
    emptyCategory: "Пока нет блюд",
    soldOut: "Закончилось",
    soldOutToday: "На сегодня закончилось",
    add: "Добавить",
    addToCart: "Добавить в корзину",
    cart: "Корзина",
    checkoutTitle: "Ваш заказ",
    done: "Готово!",
    close: "Закрыть",
    orderAccepted: "заказ принят",
    waiterComing: "Официант скоро подойдёт. Приятного аппетита!",
    backToMenu: "Вернуться в меню",
    emptyCart: "Корзина пуста",
    remove: "Удалить",
    removeUnavailable: "Закончилось — удалите из заказа",
    free: "бесплатно",
    total: "Итого",
    tableNumber: "Номер стола",
    tablePlaceholder: "Например: 7",
    comment: "Комментарий",
    optional: "необязательно",
    commentPlaceholder: "Без лука, не остро...",
    soldOutInCart: "В заказе есть закончившееся блюдо. Удалите его",
    enterTable: "Введите номер стола",
    requestFailed: "Не удалось оформить заказ",
    sending: "Отправляем...",
    placeOrder: "Оформить заказ",
    decrease: "Уменьшить",
    increase: "Увеличить",
  },
} as const;

type TranslationKey = keyof typeof translations.kk;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "qr-menu-language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("kk");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "kk" || saved === "ru") setLanguage(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: (key: TranslationKey) => translations[language][key],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return context;
}

export function localizedText(
  language: Language,
  kazakh: string,
  russian?: string | null,
) {
  return language === "ru" ? russian?.trim() || kazakh : kazakh;
}
