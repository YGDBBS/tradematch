-- Contractor onboarding fields: business type, employee count, employer vs employee.
-- Null for customers; set during onboarding for contractors.

alter table public.profiles
  add column if not exists business_type text check (business_type is null or business_type in ('sole_trader', 'ltd')),
  add column if not exists employee_count integer check (employee_count is null or employee_count >= 0),
  add column if not exists is_employer boolean;
