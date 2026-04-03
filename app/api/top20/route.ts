import { NextResponse } from 'next/server';
import { Top20Orchestrator } from '@/lib/agency/top20Orchestrator';

export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const agency = new Top20Orchestrator();
    const products = await agency.runResearchCycle();

    return NextResponse.json({ 
      success: true, 
      count: products.length,
      products 
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API Top20] Error general:', err);
    return NextResponse.json({ error: message, success: false }, { status: 500 });
  }
}
