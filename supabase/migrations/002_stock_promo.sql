-- ════════════════════════════════════════════════════════════
--  002: «Бітіп қалды» + 1+1 акциясы
--  Supabase Dashboard → SQL Editor → осы файлды іске қос
-- ════════════════════════════════════════════════════════════

-- Тағамға акция түрі (null = акция жоқ)
alter table public.menu_items
  add column if not exists promo text;

do $$ begin
  alter table public.menu_items
    add constraint menu_items_promo_check check (promo is null or promo in ('1+1'));
exception when duplicate_object then null; end $$;

-- Тапсырыстағы тегін порциялар саны (1+1 бойынша)
alter table public.order_items
  add column if not exists free_quantity int not null default 0 check (free_quantity >= 0);
