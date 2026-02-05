-- Requests: customer job requests for the marketplace.
-- Customers create requests; contractors will be matched to them (B2).
-- RLS: customers can CRUD their own requests.
-- Safe to run multiple times: uses conditional creation only (no DROP).

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  trade text,
  postcode text,
  budget_min numeric(12, 2),
  budget_max numeric(12, 2),
  timeline text,
  status text not null default 'draft' check (status in (
    'draft', 'open', 'assigned', 'in_progress', 'completed', 'cancelled'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_requests_customer_id on public.requests (customer_id);
create index if not exists idx_requests_status on public.requests (status);

alter table public.requests enable row level security;

-- RLS: customers can access their own requests
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'requests' and policyname = 'Customers can read own requests') then
    create policy "Customers can read own requests" on public.requests for select
      using (auth.uid() = customer_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'requests' and policyname = 'Customers can insert own requests') then
    create policy "Customers can insert own requests" on public.requests for insert
      with check (auth.uid() = customer_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'requests' and policyname = 'Customers can update own requests') then
    create policy "Customers can update own requests" on public.requests for update
      using (auth.uid() = customer_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'requests' and policyname = 'Customers can delete own requests') then
    create policy "Customers can delete own requests" on public.requests for delete
      using (auth.uid() = customer_id);
  end if;
end $$;

-- Updated_at trigger for requests
do $$
begin
  if not exists (
    select 1 from pg_trigger t
    join pg_class c on t.tgrelid = c.oid
    join pg_namespace n on c.relnamespace = n.oid
    where n.nspname = 'public' and c.relname = 'requests' and t.tgname = 'requests_updated_at'
  ) then
    create trigger requests_updated_at before update on public.requests for each row execute function public.set_updated_at();
  end if;
end $$;
