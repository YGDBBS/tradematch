-- Request matches: links customer requests to matched contractors.
-- Contractors see requests they're matched to; customers see who's matched.
-- Safe to run multiple times: uses conditional creation only (no DROP).

create table if not exists public.request_matches (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  contractor_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in (
    'pending', 'accepted', 'declined'
  )),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, contractor_id)
);

create index if not exists idx_request_matches_request_id on public.request_matches (request_id);
create index if not exists idx_request_matches_contractor_id on public.request_matches (contractor_id);
create index if not exists idx_request_matches_status on public.request_matches (status);

alter table public.request_matches enable row level security;

-- RLS: customers can see matches for their own requests
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'request_matches' and policyname = 'Customers can read matches for own requests') then
    create policy "Customers can read matches for own requests" on public.request_matches for select
      using (exists (
        select 1 from public.requests where requests.id = request_matches.request_id and requests.customer_id = auth.uid()
      ));
  end if;
end $$;

-- RLS: contractors can see matches where they are the contractor
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'request_matches' and policyname = 'Contractors can read own matches') then
    create policy "Contractors can read own matches" on public.request_matches for select
      using (auth.uid() = contractor_id);
  end if;
end $$;

-- RLS: contractors can update their own matches (to accept/decline)
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'request_matches' and policyname = 'Contractors can update own matches') then
    create policy "Contractors can update own matches" on public.request_matches for update
      using (auth.uid() = contractor_id);
  end if;
end $$;

-- RLS: service role can insert matches (for matching API)
-- Note: We use service role for the matching endpoint, so no user-level insert policy needed

-- Updated_at trigger for request_matches
do $$
begin
  if not exists (
    select 1 from pg_trigger t
    join pg_class c on t.tgrelid = c.oid
    join pg_namespace n on c.relnamespace = n.oid
    where n.nspname = 'public' and c.relname = 'request_matches' and t.tgname = 'request_matches_updated_at'
  ) then
    create trigger request_matches_updated_at before update on public.request_matches for each row execute function public.set_updated_at();
  end if;
end $$;
