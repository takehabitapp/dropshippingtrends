import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateProductImage } from '@/lib/services/creatives';

export async function POST(req: Request) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    // Update status to saved
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ status: 'saved' })
      .eq('id', productId)
      .select('*')
      .single();

    if (updateError || !updatedProduct) {
      console.error('Error updating product status:', updateError);
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    // Call DALL-E in background, don't await so the UI feels fast.
    // However, in serverless environments like Vercel, background tasks might be killed if the response returns.
    // To solve this properly, we should use a queue, or Next.js edge functions with waitUntil,
    // but for an MVP, we'll await it, or just use Vercel's after() if available.
    // For simplicity in this Node MVP, we will await it.
    
    // Actually, awaiting DALL-E might take 10-20 seconds. It's better to await it so the client knows it finished,
    // or return a `202 Accepted` and let the client poll the creatives table. 
    // Let's await it to keep the MVP simple.
    
    const imageUrls = await generateProductImage(updatedProduct);
    
    if (imageUrls.length > 0) {
      const inserts = imageUrls.map(url => ({
        product_id: productId,
        image_url: url,
        status: 'done' as const
      }));
      
      const { error: insertError } = await supabase
        .from('creatives')
        .insert(inserts);

      if (insertError) {
        console.error('Error saving creatives to DB:', insertError);
      }
    }

    return NextResponse.json({ success: true, product: updatedProduct });

  } catch (err: any) {
    console.error('Error in /api/save:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
