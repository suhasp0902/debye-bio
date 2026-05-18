import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * DATABASE PREPARATION (SQL SCHEMA SUGGESTION)
 * 
 * -- 1. Profiles Table (Linked to Auth)
 * create table public.profiles (
 *   id uuid references auth.users on delete cascade not null primary key,
 *   full_name text,
 *   company text,
 *   avatar_url text,
 *   updated_at timestamp with time zone default timezone('utc'::text, now())
 * );
 * 
 * -- 2. Projects Table
 * create table public.projects (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id uuid references auth.users not null,
 *   name text not null,
 *   data jsonb not null,
 *   is_public boolean default false,
 *   created_at timestamp with time zone default timezone('utc'::text, now())
 * );
 * 
 * -- Enable RLS
 * alter table public.profiles enable row level security;
 * alter table public.projects enable row level security;
 */

