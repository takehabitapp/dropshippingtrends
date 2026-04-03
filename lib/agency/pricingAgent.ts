import { openai } from '../openai';
import { ProductReview, AgentContext } from './types';

export class PricingAgent {
  async run(context: AgentContext): Promise<Partial<ProductReview>[]> {
    console.log(`[Agent: Pricing] Calculando precios y márgenes para ${context.candidates.length} productos...`);

    const promises = context.candidates.map(async (candidate) => {
      const supplierPrice = candidate.supplier?.price || 10;
      
      const prompt = `
      Producto: "${candidate.name}"
      Costo Proveedor Est.: $${supplierPrice}
      Teniendo en cuenta el costo de producto, estima el "marketPrice" (precio actual en mercado) y "recommendedPrice" (tu precio de venta sugerido).
      Calcula el "estimatedMargin" (como porcentaje numérico, considerando el (precio_venta - costo) / precio_venta % - o solo el % bruto antes de ads) y estima la dificultad de entrada ("baja", "media", "alta") y el potencial de branding ("bajo", "medio", "alto").
      Responde SOLO con JSON sin markdown:
      {
        "marketPrice": 29.99,
        "recommendedPrice": 34.99,
        "estimatedMargin": 65,  // solo numero
        "entryDifficulty": "media",
        "brandingPotential": "alto"
      }
      `;

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Eres un economista de e-commerce y experto en pricing strategy.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
        });

        const content = response.choices[0].message.content || '{}';
        const jsonMatch = content.match(/\{[\s\S]*\}/) ? content.match(/\{[\s\S]*\}/)![0] : content;
        const parsed = JSON.parse(jsonMatch);

        return { 
          ...candidate, 
          marketPrice: parsed.marketPrice,
          recommendedPrice: parsed.recommendedPrice,
          estimatedMargin: parsed.estimatedMargin,
          entryDifficulty: parsed.entryDifficulty,
          brandingPotential: parsed.brandingPotential
        };
      } catch (e) {
        console.error('[Agent: Pricing] Error para', candidate.name);
        return { 
          ...candidate, 
          marketPrice: 0, recommendedPrice: 0, estimatedMargin: 0, entryDifficulty: 'alta', brandingPotential: 'bajo' 
        } as any;
      }
    });

    return Promise.all(promises);
  }
}
