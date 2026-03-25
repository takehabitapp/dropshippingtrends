import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateMockProducts } from '@/lib/services/products';

export async function POST(req: Request) {
  try {
    // Generate 30 fake products
    const products = generateMockProducts(30);
    
    // Save all to database
    // We remove the status 'candidate'/'top' momentarily if you want to rely on DB,
    // but we can just insert them as they are formatted correctly.
    const { data: inserted, error } = await supabase
      .from('products')
      .insert(products)
      .select('*');

    if (error) {
      console.error('Supabase Insert Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the inserted products to the client immediately
    return NextResponse.json({ success: true, products: inserted });

  } catch (err: any) {
    console.error('Error in /api/explore:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
