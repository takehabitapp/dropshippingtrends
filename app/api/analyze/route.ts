import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateProductAnalysis } from '@/lib/services/analysis';

export async function POST(req: Request) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    // Fetch product
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if already analyzed
    if (product.status === 'analyzed' || product.status === 'saved') {
      const { data: existingAnalysis } = await supabase
        .from('analysis')
        .select('*')
        .eq('product_id', productId)
        .single();
      
      if (existingAnalysis) {
        return NextResponse.json({ success: true, analysis: existingAnalysis });
      }
    }

    // Call OpenAI
    const analysisData = await generateProductAnalysis(product);

    // Save to DB
    const { data: insertedAnalysis, error: insertError } = await supabase
      .from('analysis')
      .insert([
        {
          product_id: product.id,
          ...analysisData
        }
      ])
      .select('*')
      .single();

    if (insertError) {
      console.error('Failed to save analysis to DB:', insertError);
      return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 });
    }

    // Update status to analyzed if it was top
    if (product.status === 'top') {
      await supabase
        .from('products')
        .update({ status: 'analyzed' })
        .eq('id', productId);
    }

    return NextResponse.json({ success: true, analysis: insertedAnalysis });

  } catch (err: any) {
    console.error('Error in /api/analyze:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
