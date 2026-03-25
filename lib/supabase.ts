import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

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
