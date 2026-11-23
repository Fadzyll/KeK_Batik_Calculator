-- Kek Batik Sales Management System — Supabase schema
-- Run this whole file once in Supabase Dashboard → SQL Editor → New query → Run.
-- Every table is protected by Row Level Security: a signed-in user only sees their own rows.

-- ---------------------------------------------------------------------------
-- Ingredients: what you buy and how big the pack is.
-- e.g. Milo 1kg tin for RM32.90  →  pack_price 32.90, pack_size 1000, unit 'g'
-- ---------------------------------------------------------------------------
create table if not exists public.ingredients (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  pack_price  numeric(10, 2) not null check (pack_price >= 0),
  pack_size   numeric(12, 3) not null check (pack_size > 0),
  unit        text not null default 'g',  -- g, ml, pcs, etc.
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Recipes: one recipe = one 8x8 inch loyang (e.g. "Kek Batik Milo Original").
-- ---------------------------------------------------------------------------
create table if not exists public.recipes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name            text not null,
  pan_size_inch   numeric(5, 2) not null default 8 check (pan_size_inch > 0),
  default_grid    int not null default 4 check (default_grid between 1 and 20), -- 4 = 4x4 = 16 pieces
  target_margin   numeric(5, 2) not null default 50 check (target_margin >= 0 and target_margin < 100), -- percent
  rounding_step   numeric(6, 2) not null default 0.50 check (rounding_step >= 0), -- round price up to this (RM)
  notes           text,
  created_at      timestamptz not null default now()
);

-- How much of each ingredient one loyang uses.
create table if not exists public.recipe_items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recipe_id      uuid not null references public.recipes (id) on delete cascade,
  ingredient_id  uuid not null references public.ingredients (id) on delete restrict,
  quantity_used  numeric(12, 3) not null check (quantity_used > 0),
  created_at     timestamptz not null default now(),
  unique (recipe_id, ingredient_id)
);

-- Extra costs: packaging, gas/electric, labour.
-- per_loyang = cost once per pan, per_piece = cost for every piece (e.g. plastic wrap / box).
create table if not exists public.extra_costs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recipe_id   uuid not null references public.recipes (id) on delete cascade,
  name        text not null,
  amount      numeric(10, 2) not null check (amount >= 0),
  cost_type   text not null default 'per_loyang' check (cost_type in ('per_loyang', 'per_piece')),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Expenses: every time you spend money (ingredient shopping, boxes, gas…).
-- ---------------------------------------------------------------------------
create table if not exists public.expenses (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  expense_date   date not null default current_date,
  description    text not null,
  category       text not null default 'ingredient' check (category in ('ingredient', 'packaging', 'utilities', 'other')),
  ingredient_id  uuid references public.ingredients (id) on delete set null,
  quantity       numeric(12, 3) check (quantity is null or quantity > 0), -- number of packs bought
  amount         numeric(10, 2) not null check (amount >= 0),            -- total RM paid
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Sales
-- ---------------------------------------------------------------------------
create table if not exists public.sales (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  sale_date        date not null default current_date,
  recipe_id        uuid references public.recipes (id) on delete set null,
  customer         text,
  pieces           int not null check (pieces > 0),
  price_per_piece  numeric(10, 2) not null check (price_per_piece >= 0),
  total            numeric(12, 2) generated always as (pieces * price_per_piece) stored,
  notes            text,
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists ingredients_user_idx   on public.ingredients (user_id);
create index if not exists recipes_user_idx       on public.recipes (user_id);
create index if not exists recipe_items_recipe_idx on public.recipe_items (recipe_id);
create index if not exists extra_costs_recipe_idx on public.extra_costs (recipe_id);
create index if not exists expenses_user_date_idx on public.expenses (user_id, expense_date desc);
create index if not exists sales_user_date_idx    on public.sales (user_id, sale_date desc);

-- ---------------------------------------------------------------------------
-- Row Level Security: owner-only access on every table
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['ingredients', 'recipes', 'recipe_items', 'extra_costs', 'expenses', 'sales']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "owner_all" on public.%I', t);
    execute format(
      'create policy "owner_all" on public.%I for all to authenticated
         using (user_id = (select auth.uid()))
         with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;

-- Keep ingredients.updated_at fresh
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists ingredients_touch on public.ingredients;
create trigger ingredients_touch before update on public.ingredients
  for each row execute function public.touch_updated_at();
