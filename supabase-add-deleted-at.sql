-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Adds deleted_at column to profiles for tracking past members

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- Query to see past members:
-- SELECT id, deleted_at, created_at FROM profiles WHERE deleted_at IS NOT NULL;
