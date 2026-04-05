import { openai } from '../openai';
import { ProductReview, AgentContext } from './types';

export class PricingAgent {
  async run(context: AgentContext): Promise<Partial<ProductReview>[]> {
    console.log(`[Agent: Pricing] Experto en Estrategia de Precios analizando ${context.candidates.length} productos...`);

    const promises = context.candidates.map(async (candidate) => {
      const supplierPrice = candidate.supplier?.price || 10;

      const prompt = `
      Actúa como un experto en Unit Economics y estrategia de precios para E-commerce.
      Producto: "${candidate.name}"
      Costo Proveedor Est.: $${supplierPrice}
      
      Debes calcular una estrategia de precios realista. No uses valores genéricos.
      Considera:
      - Costo de Adquisición de Cliente (CAC) estimado: $10-$20.
      - Costo de envío: $3-$8.
      - Margen neto deseado: >20%.
      
      Devuelve un JSON exacto:
      {
        "marketPrice": 0.00, // Precio real en tiendas como Amazon o competidores top
        "recommendedPrice": 0.00, // Tu precio sugerido para maximizar conversión y margen
        "estimatedMargin": 0, // Porcentaje de margen BRUTO ((P.Venta - P.Costo) / P.Venta * 100)
        "entryDifficulty": "baja | media | alta",
        "brandingPotential": "bajo | medio | alto",
        "competitionLevel": "baja | media | alta"
      }
      
      Asegúrate de que los precios varíen según la calidad percibida del producto y no sean siempre .99 generico.
      Solo responde con el objeto JSON crudo.
      `;

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Eres un experto en finanzas de e-commerce y pricing dinámico.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7, // Higher temperature for more variety as requested
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
          brandingPotential: parsed.brandingPotential,
          competitionLevel: parsed.competitionLevel
        } as Partial<ProductReview>;
      } catch (e) {
        console.error('[Agent: Pricing] Error para', candidate.name);
        return {
          ...candidate,
          marketPrice: supplierPrice * 3,
          recommendedPrice: supplierPrice * 3.5,
          estimatedMargin: 65,
          entryDifficulty: 'media',
          brandingPotential: 'medio',
          competitionLevel: 'media'
        } as Partial<ProductReview>;
      }
    });

    return Promise.all(promises);
  }
}
