import { ProductReview, AgentContext } from './types';
import { Top20TrendsAgent } from './top20TrendsAgent';
import { ValidationAgent } from './validationAgent';
import { SupplierAgent } from './supplierAgent';
import { CompetitorAgent } from './competitorAgent';
import { PricingAgent } from './pricingAgent';
import { ScoringAgent } from './scoringAgent';

export class Top20Orchestrator {
  async runResearchCycle(): Promise<ProductReview[]> {
    console.log('[Top20 Agency] Iniciando generación Top 20 Moda...');
    let context: AgentContext = { query: 'moda', candidates: [] };

    // 1. Top20 Trends (Specialized agent for 20 fashion products)
    const trends = new Top20TrendsAgent();
    context.candidates = await trends.run();
    if (!context.candidates.length) return [];

    console.log(`[Top20 Agency] Validando logística de ${context.candidates.length} candidatos...`);
    const validation = new ValidationAgent();
    context.candidates = await validation.run(context);

    console.log(`[Top20 Agency] Analizando el resto en paralelo (Proveedores, Competencia, Pricing)...`);

    // We can run these agents sequentially, but wait, the supplier/competitor/pricing agents 
    // are written to map over context.candidates internally using Promise.all
    // So we can just call them one after the other, and inside they run perfectly in parallel for all 20 products!
    
    // 2. Proveedores
    const supplier = new SupplierAgent();
    context.candidates = await supplier.run(context);

    // 3. Competencia
    const competitor = new CompetitorAgent();
    context.candidates = await competitor.run(context);

    // 4. Precios y Márgenes
    const pricing = new PricingAgent();
    context.candidates = await pricing.run(context);

    // 5. Scoring (the scoring agent uses all the context filled above)
    const scoring = new ScoringAgent();
    const finalProducts = await scoring.run(context);

    console.log(`[Top20 Agency] Ciclo completado. Generados ${finalProducts.length} productos.`);
    
    // Sort by score descending and return exactly top 20
    const sorted = finalProducts.sort((a, b) => b.finalScore - a.finalScore).slice(0, 20);
    return sorted;
  }
}
