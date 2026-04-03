import { ProductReview, AgentContext } from './types';
import { TrendsAgent } from './trendsAgent';
import { ValidationAgent } from './validationAgent';
import { SupplierAgent } from './supplierAgent';
import { CompetitorAgent } from './competitorAgent';
import { PricingAgent } from './pricingAgent';
import { ScoringAgent } from './scoringAgent';

export class ResearchAgency {
  async runResearchCycle(query: string): Promise<ProductReview[]> {
    console.log('[Agency] Iniciando Deep Analysis para:', query);
    let context: AgentContext = { query, candidates: [] };

    console.log('[Agency] Paso 1: Tendencias');
    const trends = new TrendsAgent();
    context.candidates = await trends.run(context);
    if (!context.candidates.length) return [];

    console.log('[Agency] Paso 2: Validación');
    const validation = new ValidationAgent();
    context.candidates = await validation.run(context);
    if (!context.candidates.length) return [];

    console.log('[Agency] Paso 3: Proveedores');
    const supplier = new SupplierAgent();
    context.candidates = await supplier.run(context);

    console.log('[Agency] Paso 4: Competencia');
    const competitor = new CompetitorAgent();
    context.candidates = await competitor.run(context);

    console.log('[Agency] Paso 5: Pricing y Márgenes');
    const pricing = new PricingAgent();
    context.candidates = await pricing.run(context);

    console.log('[Agency] Paso 6: Scoring Final');
    const scoring = new ScoringAgent();
    const finalProducts = await scoring.run(context);

    console.log(`[Agency] Ciclo completado. ${finalProducts.length} leads retornados.`);
    
    // Sort by score descending
    const sorted = finalProducts.sort((a, b) => b.finalScore - a.finalScore);
    return sorted;
  }
}
