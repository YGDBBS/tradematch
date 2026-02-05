-- Quotes: linked to a job, owned by contractor via job.contractor_id.
-- RLS: contractors can only access quotes for their own jobs.
-- Safe to run multiple times: uses conditional creation only (no DROP).

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  status text not null default 'draft' check (status in (
    'draft', 'sent', 'accepted', 'declined'
  )),
  amount numeric(12, 2) not null,
  description text,
  line_items jsonb,
  valid_until date,
  sent_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_quotes_job_id on public.quotes (job_id);
create index if not exists idx_quotes_status on public.quotes (status);

alter table public.quotes enable row level security;

-- RLS: access quotes only if you own the parent job
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quotes' and policyname = 'Contractors can read own quotes') then
    create policy "Contractors can read own quotes" on public.quotes for select
      using (exists (
        select 1 from public.jobs where jobs.id = quotes.job_id and jobs.contractor_id = auth.uid()
      ));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quotes' and policyname = 'Contractors can insert own quotes') then
    create policy "Contractors can insert own quotes" on public.quotes for insert
      with check (exists (
        select 1 from public.jobs where jobs.id = quotes.job_id and jobs.contractor_id = auth.uid()
      ));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quotes' and policyname = 'Contractors can update own quotes') then
    create policy "Contractors can update own quotes" on public.quotes for update
      using (exists (
        select 1 from public.jobs where jobs.id = quotes.job_id and jobs.contractor_id = auth.uid()
      ));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quotes' and policyname = 'Contractors can delete own quotes') then
    create policy "Contractors can delete own quotes" on public.quotes for delete
      using (exists (
        select 1 from public.jobs where jobs.id = quotes.job_id and jobs.contractor_id = auth.uid()
      ));
  end if;
end $$;

-- Updated_at trigger for quotes
do $$
begin
  if not exists (
    select 1 from pg_trigger t
    join pg_class c on t.tgrelid = c.oid
    join pg_namespace n on c.relnamespace = n.oid
    where n.nspname = 'public' and c.relname = 'quotes' and t.tgname = 'quotes_updated_at'
  ) then
    create trigger quotes_updated_at before update on public.quotes for each row execute function public.set_updated_at();
  end if;
end $$;
