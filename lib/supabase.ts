import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error('Missing Supabase environment variables. Check your .env.local file.');
  return createClient(url, anon);
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || (!serviceKey && !anon)) throw new Error('Missing Supabase environment variables. Check your .env.local file.');
  return createClient(url, serviceKey || anon!);
}

export const supabase = { get: getSupabase };
export const supabaseAdmin = { get: getSupabaseAdmin };
