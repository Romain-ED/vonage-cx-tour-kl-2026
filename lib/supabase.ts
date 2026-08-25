import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error('Missing Supabase environment variables. Check your .env.local file.');
  _supabase = createClient(url, anon);
  return _supabase;
}

function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || (!serviceKey && !anon)) throw new Error('Missing Supabase environment variables. Check your .env.local file.');
  _supabaseAdmin = createClient(url, serviceKey || anon!);
  return _supabaseAdmin;
}

export const supabase = { get: getSupabase };
export const supabaseAdmin = { get: getSupabaseAdmin };
