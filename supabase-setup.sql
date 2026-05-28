-- Run this in your Supabase SQL Editor to set up the database

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  language TEXT NOT NULL DEFAULT 'en',
  meeting_requested BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS contacts_email_idx ON contacts(email);
CREATE INDEX IF NOT EXISTS contacts_meeting_idx ON contacts(meeting_requested);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon (registration form)
CREATE POLICY "Allow insert from anyone" ON contacts
  FOR INSERT TO anon WITH CHECK (true);

-- Allow service role full access (admin panel)
CREATE POLICY "Allow service role full access" ON contacts
  FOR ALL TO service_role USING (true);

-- Optional: Allow select with anon key (if you want to skip service role)
-- CREATE POLICY "Allow select from anyone" ON contacts FOR SELECT TO anon USING (true);
