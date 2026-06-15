import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

const hasUrl = Boolean(supabaseUrl && supabaseUrl.startsWith('https://'));
const hasAnonKey = Boolean(supabaseAnonKey && supabaseAnonKey.length > 20);

export const hasSupabaseConfig = hasUrl && hasAnonKey;

export const supabase: SupabaseClient<Database> | null = hasSupabaseConfig
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null;

export const supabaseConfigError =
  'Supabase 연결 정보가 없습니다. .env 파일에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 설정한 뒤 다시 실행해주세요.';
