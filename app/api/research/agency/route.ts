import { NextResponse } from 'next/server';
import { ResearchAgency } from '@/lib/agency/orchestrator';

export async function GET() {
  try {
    const agency = new ResearchAgency();
    const results = await agency.runResearchCycle('productos en tendencia');

    
    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Agency Research Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
