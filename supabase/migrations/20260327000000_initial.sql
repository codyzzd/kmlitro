-- =============================================================
-- KmLitro — Migration inicial
-- =============================================================

-- -------------------------------------------------------
-- VEHICLES
-- -------------------------------------------------------
create table public.vehicles (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  nickname    text        not null,
  brand       text        not null,
  model       text,
  year        integer     not null check (year >= 1900 and year <= 2100),
  created_at  timestamptz not null default now()
);

alter table public.vehicles enable row level security;

create policy "vehicles: acesso somente ao dono"
  on public.vehicles
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index vehicles_user_id_idx on public.vehicles(user_id);

-- -------------------------------------------------------
-- FILLUPS
-- -------------------------------------------------------
create table public.fillups (
  id               uuid        primary key default gen_random_uuid(),
  vehicle_id       uuid        not null references public.vehicles(id) on delete cascade,
  user_id          uuid        not null references auth.users(id) on delete cascade,
  date             timestamptz not null,
  no_data          boolean     not null default false,
  odometer         numeric,
  liters           numeric,
  price_per_liter  numeric,
  total_paid       numeric,
  fuel_type        text        not null check (fuel_type in ('gasoline', 'ethanol', 'diesel', 'gnv')),
  full_tank        boolean     not null default true,
  notes            text,
  created_at       timestamptz not null default now()
);

alter table public.fillups enable row level security;

create policy "fillups: acesso somente ao dono"
  on public.fillups
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index fillups_vehicle_id_idx on public.fillups(vehicle_id);
create index fillups_user_id_idx    on public.fillups(user_id);
create index fillups_date_idx       on public.fillups(date desc);

-- -------------------------------------------------------
-- USER_SETTINGS
-- -------------------------------------------------------
create table public.user_settings (
  user_id            uuid  primary key references auth.users(id) on delete cascade,
  decimal_separator  text  not null default ','  check (decimal_separator in (',', '.')),
  color_theme        text  not null default 'system' check (color_theme in ('system', 'light', 'dark')),
  user_name          text  not null default '',
  user_email         text  not null default '',
  default_vehicle_id uuid  references public.vehicles(id) on delete set null,
  updated_at         timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "user_settings: acesso somente ao dono"
  on public.user_settings
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -------------------------------------------------------
-- TRIGGER: cria user_settings automaticamente no cadastro
-- -------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.user_settings (user_id, user_email)
  values (new.id, coalesce(new.email, ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
