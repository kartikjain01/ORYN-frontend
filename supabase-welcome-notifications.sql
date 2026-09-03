-- ============================================================
-- ORYN Engine — Auto Welcome Notifications on Signup
-- Run this AFTER supabase-notifications.sql
-- ============================================================

create or replace function public.send_welcome_notifications()
returns trigger as $$
begin
  insert into public.notifications (user_id, title, body, type) values
    (
      new.id,
      'Welcome to ORYN Engine',
      'Your AI voice studio is ready. Clone voices, generate speech, edit audio — all in one place.',
      'success'
    ),
    (
      new.id,
      'Get started with Voice Clone',
      'Upload a short audio sample and create your first AI voice clone in under a minute.',
      'info'
    ),
    (
      new.id,
      'Tip: Try Text to Speech',
      'Type any text and generate natural-sounding audio instantly. Choose from multiple voices and languages.',
      'update'
    );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_created_welcome on public.profiles;
create trigger on_profile_created_welcome
  after insert on public.profiles
  for each row execute function public.send_welcome_notifications();
