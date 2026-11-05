-- ════════════════════════════════════════════════════════════
--  QR-MENU — Supabase схемасы
--  Supabase Dashboard → SQL Editor → осы файлды толық іске қос
-- ════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Категориялар ────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

-- ── Тағамдар ────────────────────────────────────────────────
create table if not exists public.menu_items (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.categories(id) on delete cascade,
  name         text not null,
  description  text,
  price        int  not null check (price >= 0),   -- теңгемен, бүтін сан
  image_url    text,
  is_available boolean not null default true,
  promo        text check (promo is null or promo in ('1+1')),  -- акция
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists menu_items_category_idx on public.menu_items(category_id);

-- ── Тапсырыстар ─────────────────────────────────────────────
do $$ begin
  create type order_status as enum ('new', 'cooking', 'ready', 'served', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  order_number  bigint generated always as identity,
  table_number  text not null,
  comment       text,
  total         int  not null check (total >= 0),
  status        order_status not null default 'new',
  created_at    timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders(created_at desc);

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  menu_item_id  uuid references public.menu_items(id) on delete set null,
  name          text not null,   -- сол сәттегі атауы (snapshot)
  price         int  not null,   -- сол сәттегі бағасы (snapshot)
  quantity      int  not null check (quantity > 0),
  free_quantity int  not null default 0 check (free_quantity >= 0)  -- 1+1 тегін порциялар
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- ── RLS (Row Level Security) ────────────────────────────────
-- Қонақтар мәзірді тек ОҚИ алады. Тапсырыс тек сервер арқылы
-- (service_role кілтімен) жазылады — клиент бағаны бұрмалай алмайды.
alter table public.categories  enable row level security;
alter table public.menu_items  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories
  for select using (true);

drop policy if exists "public read menu_items" on public.menu_items;
create policy "public read menu_items" on public.menu_items
  for select using (true);
-- orders / order_items үшін policy жоқ → anon кілтпен қолжетімсіз.

-- ── Demo деректер ───────────────────────────────────────────
insert into public.categories (name, slug, sort_order) values
  ('Сусындар',        'drinks',   1),
  ('Фастфуд',         'fastfood', 2),
  ('Негізгі тағамдар','main',     3),
  ('Десерттер',       'desserts', 4)
on conflict (slug) do nothing;

insert into public.menu_items (category_id, name, description, price, image_url, sort_order)
select c.id, v.name, v.description, v.price, v.image_url, v.sort_order
from (values
  ('drinks',   'Лимонад «Жалбыз»',  'Үйде жасалған, жалбыз бен лайм',          1200, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800', 1),
  ('drinks',   'Капучино',          'Қос эспрессо, сүт көбігі',                 1100, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800', 2),
  ('fastfood', 'Классик бургер',    'Сиыр котлеті, чеддер, қияр, соус',        2900, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 1),
  ('fastfood', 'Фри',               'Қытырлақ картоп, тұз',                     900, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800', 2),
  ('main',     'Бешбармақ',         'Жылқы еті, қамыр, сорпа',                 4500, 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800', 1),
  ('main',     'Стейк рибай',       '300 г, гриль көкөніс',                    8900, 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800', 2),
  ('desserts', 'Чизкейк',           'Нью-Йорк классикасы, жидек соусы',        1800, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800', 1),
  ('desserts', 'Бауырсақ бал мен',  'Ыстық бауырсақ, тау балы',                1000, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800', 2)
) as v(slug, name, description, price, image_url, sort_order)
join public.categories c on c.slug = v.slug
where not exists (select 1 from public.menu_items m where m.name = v.name);
