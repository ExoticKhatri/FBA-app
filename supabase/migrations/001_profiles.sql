-- Run this in your Supabase project's SQL Editor (https://dcufwsfrpweewtulywug.supabase.co)
-- Dashboard → SQL Editor → New query → paste and run

create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  is_premium  boolean not null default false,
  premium_expires_at timestamptz,
  razorpay_subscription_id text,
  updated_at  timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile (needed for the verify route)
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Users can insert their own profile row
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
