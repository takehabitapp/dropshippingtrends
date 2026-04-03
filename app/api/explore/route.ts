import { NextResponse } from 'next/server';
import { ResearchAgency } from '@/lib/agency/orchestrator';

// Aumentamos el máximo de duración para serverless functions si estamos en Vercel
export const maxDuration = 60; // Max permitted on Hobby plan, or higher on Pro

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || query.trim() === '') {
      return NextResponse.json({ error: 'Query is missing or empty' }, { status: 400 });
    }

    const agency = new ResearchAgency();
    const products = await agency.runResearchCycle(query);

    return NextResponse.json({ 
      success: true, 
      count: products.length,
      products 
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API Explore] Error general:', err);
    return NextResponse.json({ error: message, success: false }, { status: 500 });
  }
}
