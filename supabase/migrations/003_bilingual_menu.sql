alter table public.categories
  add column if not exists name_ru text;

alter table public.menu_items
  add column if not exists name_ru text,
  add column if not exists description_ru text;

update public.categories
set name_ru = translations.name_ru
from (values
  ('drinks', 'Напитки'),
  ('fastfood', 'Фастфуд'),
  ('main', 'Основные блюда'),
  ('desserts', 'Десерты')
) as translations(slug, name_ru)
where public.categories.slug = translations.slug
  and public.categories.name_ru is null;

update public.menu_items
set name_ru = translations.name_ru,
    description_ru = translations.description_ru
from (values
  ('Лимонад «Жалбыз»', 'Лимонад «Мята»', 'Домашний лимонад с мятой и лаймом'),
  ('Капучино', 'Капучино', 'Двойной эспрессо и молочная пенка'),
  ('Классик бургер', 'Классический бургер', 'Говяжья котлета, чеддер, огурец, соус'),
  ('Фри', 'Картофель фри', 'Хрустящий картофель с солью'),
  ('Бешбармақ', 'Бешбармак', 'Конина, тесто и бульон'),
  ('Стейк рибай', 'Стейк рибай', '300 г, овощи на гриле'),
  ('Чизкейк', 'Чизкейк', 'Классический чизкейк с ягодным соусом'),
  ('Бауырсақ бал мен', 'Баурсаки с мёдом', 'Горячие баурсаки с горным мёдом')
) as translations(name, name_ru, description_ru)
where public.menu_items.name = translations.name
  and public.menu_items.name_ru is null;
