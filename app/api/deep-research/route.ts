import { NextResponse } from 'next/server';
import { DeepResearchAgent } from '@/lib/agency/deepResearchAgent';
import { ProductReview } from '@/lib/agency/types';

export async function POST(req: Request) {
    try {
        const { product } = await req.json();
        if (!product) {
            return NextResponse.json({ success: false, error: 'Product is required' }, { status: 400 });
        }

        const agent = new DeepResearchAgent();
        const deepAnalysis = await agent.runDeepAnalysis(product as ProductReview);

        return NextResponse.json({
            success: true,
            deepAnalysis
        });

    } catch (error: any) {
        console.error('[Deep Research API] Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
