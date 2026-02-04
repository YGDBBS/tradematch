-- Job management (Phase 1): customers and jobs for contractors.
-- RLS: contractors see only their own customers and jobs.
-- Safe to run multiple times: uses conditional creation only (no DROP).

-- Customers: owned by a contractor (profile).
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  postcode text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_customers_contractor_id on public.customers (contractor_id);

alter table public.customers enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customers' and policyname = 'Contractors can read own customers') then
    create policy "Contractors can read own customers" on public.customers for select using (auth.uid() = contractor_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customers' and policyname = 'Contractors can insert own customers') then
    create policy "Contractors can insert own customers" on public.customers for insert with check (auth.uid() = contractor_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customers' and policyname = 'Contractors can update own customers') then
    create policy "Contractors can update own customers" on public.customers for update using (auth.uid() = contractor_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'customers' and policyname = 'Contractors can delete own customers') then
    create policy "Contractors can delete own customers" on public.customers for delete using (auth.uid() = contractor_id);
  end if;
end $$;

-- Jobs: owned by contractor, optional link to customer.
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references public.profiles (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete set null,
  title text not null,
  status text not null default 'draft' check (status in (
    'draft', 'quoted', 'scheduled', 'in_progress', 'done', 'cancelled'
  )),
  due_date date,
  scheduled_at timestamptz,
  notes text,
  amount_quoted numeric(12, 2),
  amount_invoiced numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_jobs_contractor_id on public.jobs (contractor_id);
create index if not exists idx_jobs_customer_id on public.jobs (customer_id);
create index if not exists idx_jobs_status on public.jobs (status);
create index if not exists idx_jobs_due_date on public.jobs (due_date);

alter table public.jobs enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'jobs' and policyname = 'Contractors can read own jobs') then
    create policy "Contractors can read own jobs" on public.jobs for select using (auth.uid() = contractor_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'jobs' and policyname = 'Contractors can insert own jobs') then
    create policy "Contractors can insert own jobs" on public.jobs for insert with check (auth.uid() = contractor_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'jobs' and policyname = 'Contractors can update own jobs') then
    create policy "Contractors can update own jobs" on public.jobs for update using (auth.uid() = contractor_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'jobs' and policyname = 'Contractors can delete own jobs') then
    create policy "Contractors can delete own jobs" on public.jobs for delete using (auth.uid() = contractor_id);
  end if;
end $$;

-- Updated_at trigger for customers and jobs
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (
    select 1 from pg_trigger t
    join pg_class c on t.tgrelid = c.oid
    join pg_namespace n on c.relnamespace = n.oid
    where n.nspname = 'public' and c.relname = 'customers' and t.tgname = 'customers_updated_at'
  ) then
    create trigger customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
  end if;
  if not exists (
    select 1 from pg_trigger t
    join pg_class c on t.tgrelid = c.oid
    join pg_namespace n on c.relnamespace = n.oid
    where n.nspname = 'public' and c.relname = 'jobs' and t.tgname = 'jobs_updated_at'
  ) then
    create trigger jobs_updated_at before update on public.jobs for each row execute function public.set_updated_at();
  end if;
end $$;
