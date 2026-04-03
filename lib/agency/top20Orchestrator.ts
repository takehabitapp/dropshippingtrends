import { ProductReview, AgentContext } from './types';
import { Top20TrendsAgent } from './top20TrendsAgent';
import { ValidationAgent } from './validationAgent';
import { SupplierAgent } from './supplierAgent';
import { CompetitorAgent } from './competitorAgent';
import { PricingAgent } from './pricingAgent';
import { ScoringAgent } from './scoringAgent';

export class Top20Orchestrator {
  async runResearchCycle(count: number = 20): Promise<ProductReview[]> {
    console.log(`[Top20 Agency] Iniciando generación Top ${count} Global...`);
    let context: AgentContext = { query: 'global', candidates: [] };

    // 1. TopX Trends
    const trends = new Top20TrendsAgent();
    context.candidates = await trends.run(count);
    if (!context.candidates.length) return [];

    console.log(`[Top20 Agency] Validando logística de ${context.candidates.length} candidatos...`);
    const validation = new ValidationAgent();
    context.candidates = await validation.run(context);

    console.log(`[Top20 Agency] Analizando el resto en paralelo (Proveedores, Competencia, Pricing)...`);

    // 2. Proveedores
    const supplier = new SupplierAgent();
    context.candidates = await supplier.run(context);

    // 3. Competencia
    const competitor = new CompetitorAgent();
    context.candidates = await competitor.run(context);

    // 4. Precios y Márgenes
    const pricing = new PricingAgent();
    context.candidates = await pricing.run(context);

    // 5. Scoring
    const scoring = new ScoringAgent();
    const finalProducts = await scoring.run(context);

    console.log(`[Top20 Agency] Ciclo completado. Generados ${finalProducts.length} productos.`);
    
    // Sort by score descending and return exactly Top X
    const sorted = finalProducts.sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0)).slice(0, count);
    return sorted;
  }
}
