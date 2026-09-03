-- ============================================================
-- ORYN Engine — Notifications Table
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  body text,
  type text default 'info' check (type in ('info', 'success', 'warning', 'update')),
  is_read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_user
  on public.notifications(user_id, created_at desc);

create index if not exists idx_notifications_unread
  on public.notifications(user_id, is_read)
  where is_read = false;

-- Row Level Security
alter table public.notifications enable row level security;

create policy "Users read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Users delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- Allow service_role (admin) to insert notifications for any user.
-- Inserts from the dashboard SQL editor or Edge Functions use service_role.
-- If you want to allow the anon key to insert (e.g. from backend services),
-- add a separate policy:
-- create policy "Service insert notifications"
--   on public.notifications for insert
--   with check (true);

-- Enable Realtime on this table so the frontend gets live updates
alter publication supabase_realtime add table public.notifications;
