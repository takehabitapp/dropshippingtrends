import { openai } from '../openai';
import { ProductReview, DeepAnalysis } from './types';

export class DeepResearchAgent {
    async runDeepAnalysis(product: ProductReview): Promise<DeepAnalysis> {
        console.log(`[Agent: DeepResearch] Realizando análisis exhaustivo para: ${product.name}`);

        const prompt = `
    Actúa como un Consultor Senior de E-commerce y Experto en Sourcing con +10 años de experiencia real.
    Tu tarea es realizar una "Investigación Profunda" para un producto que ya ha pasado los filtros iniciales.
    
    Producto: "${product.name}"
    Categoría: "${product.category}"
    Precio Proveedor (Elegido): $${product.supplier.price}
    Precio Venta Sugerido: $${product.recommendedPrice}
    Margen Bruto: ${product.estimatedMargin}%
    
    Debes profundizar en:
    1. Recomendación de compra inicial: ¿Cuántas unidades comprar para testear? (ej: "Comprar 50 unidades para un test de 7 días")
    2. Justificación estratégica: ¿Por qué este producto? ¿Qué ángulo de marketing usar?
    3. Fuentes recomendadas: Menciona proveedores específicos o métodos de búsqueda (ej: "CJdropshipping por su logística rápida en EU")
    4. Nivel de Riesgo Real: Se honesto sobre saturación, fragilidad del producto, o problemas legales/patentes.
    5. Potencial de Beneficio: Estimación de ROI y escalabilidad.
    
    Devuelve un JSON exacto:
    {
      "purchaseRecommendation": "...",
      "justification": "...",
      "sources": [
        { "name": "AliExpress", "url": "https://www.aliexpress.com/..." },
        { "name": "Alibaba", "url": "https://www.alibaba.com/..." }
      ],
      "riskLevel": "bajo | medio | alto | crítico",
      "profitPotential": "..."
    }
    
    Asegúrate de que las URLs de las fuentes sean enlaces de búsqueda reales para el producto "${product.name}".
    Usa un tono profesional, directo y basado en datos simulados pero realistas.
    Solo responde con el objeto JSON crudo.
    `;

        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o', // Using GPT-4o for Deep Analysis for maximum quality
                messages: [
                    { role: 'system', content: 'Eres un consultor senior de dropshipping y experto en análisis de riesgos.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.4,
            });

            const content = response.choices[0].message.content || '{}';
            const jsonMatch = content.match(/\{[\s\S]*\}/) ? content.match(/\{[\s\S]*\}/)![0] : content;
            return JSON.parse(jsonMatch) as DeepAnalysis;
        } catch (e) {
            console.error('[Agent: DeepResearch] Error:', e);
            const searchTerm = encodeURIComponent(product.name);
            return {
                purchaseRecommendation: "Comprar 20-50 unidades para testeo inicial.",
                justification: "El producto muestra una tendencia saludable pero requiere validación de mercado.",
                sources: [
                    { name: "AliExpress", url: `https://www.aliexpress.com/wholesale?SearchText=${searchTerm}` },
                    { name: "Alibaba", url: `https://www.alibaba.com/trade/search?SearchText=${searchTerm}` }
                ],
                riskLevel: "medio",
                profitPotential: "Moderado con escalabilidad vertical."
            };
        }
    }
}
