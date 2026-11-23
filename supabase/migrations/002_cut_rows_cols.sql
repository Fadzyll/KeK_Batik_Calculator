-- Let a loyang be cut into any rows × columns (e.g. 4 rows × 2 columns = 8 pieces),
-- not only an equal grid like 4×4. Safe to run more than once.
alter table public.recipes add column if not exists default_rows int;
alter table public.recipes add column if not exists default_cols int;

update public.recipes set default_rows = default_grid where default_rows is null;
update public.recipes set default_cols = default_grid where default_cols is null;

alter table public.recipes alter column default_rows set default 4;
alter table public.recipes alter column default_cols set default 4;
alter table public.recipes alter column default_rows set not null;
alter table public.recipes alter column default_cols set not null;

alter table public.recipes drop constraint if exists recipes_default_rows_check;
alter table public.recipes drop constraint if exists recipes_default_cols_check;
alter table public.recipes add constraint recipes_default_rows_check check (default_rows between 1 and 30);
alter table public.recipes add constraint recipes_default_cols_check check (default_cols between 1 and 30);
