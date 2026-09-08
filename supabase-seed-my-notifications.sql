-- ============================================================
-- Seed welcome notifications for your existing account
-- Replace YOUR_USER_ID with your actual user UUID from
-- Supabase Dashboard → Authentication → Users
-- ============================================================

insert into public.notifications (user_id, title, body, type) values
  (
    '94ca7970-78c9-4f5e-9caa-ef5cc32885e3',
    'Welcome to ORYN Engine',
    'Your AI voice studio is ready. Clone voices, generate speech, edit audio — all in one place.',
    'success'
  ),
  (
    '94ca7970-78c9-4f5e-9caa-ef5cc32885e3',
    'Get started with Voice Clone',
    'Upload a short audio sample and create your first AI voice clone in under a minute.',
    'info'
  ),
  (
    '94ca7970-78c9-4f5e-9caa-ef5cc32885e3',
    'Tip: Try Text to Speech',
    'Type any text and generate natural-sounding audio instantly. Choose from multiple voices and languages.',
    'update'
  );
