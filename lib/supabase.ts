import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    _supabase = createClient(supabaseUrl, supabaseKey);
  }
  return _supabase;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabase()[prop as keyof SupabaseClient];
  },
});

export type Product = {
  id: string;
  name: string;
  keyword: string;
  score: number;
  trend: number;
  growth: number;
  saturation: number;
  margin: number;
  status: 'candidate' | 'top' | 'analyzed' | 'saved';
  created_at: string;
};

export type Analysis = {
  id: string;
  product_id: string;
  competition_summary: string;
  price_estimate: number;
  supplier_estimate: number;
  reasoning: string;
  created_at: string;
};

export type Creative = {
  id: string;
  product_id: string;
  image_url: string;
  status: 'pending' | 'done';
  created_at: string;
};
