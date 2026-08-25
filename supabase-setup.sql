-- Run this in your Supabase SQL Editor to set up the database

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  solutions TEXT[] NOT NULL DEFAULT '{}',
  meeting_requested BOOLEAN NOT NULL DEFAULT false,
  meeting_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for faster lookups
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

-- Chat messages table (AI agent conversation logs, linked to contacts)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_contact_idx ON chat_messages(contact_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_idx ON chat_messages(created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert from anyone" ON chat_messages
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow service role full access" ON chat_messages
  FOR ALL TO service_role USING (true);

-- Analytics events table (page views, product views, resource clicks)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_session_idx ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS analytics_events_contact_idx ON analytics_events(contact_id);
CREATE INDEX IF NOT EXISTS analytics_events_type_idx ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON analytics_events(created_at);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert from anyone" ON analytics_events
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow service role full access" ON analytics_events
  FOR ALL TO service_role USING (true);
