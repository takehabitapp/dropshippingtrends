import { openai } from '../openai';
import { ProductReview, AgentContext } from './types';

export class SupplierAgent {
  async run(context: AgentContext): Promise<Partial<ProductReview>[]> {
    console.log(`[Agent: Supplier] Buscando proveedores para ${context.candidates.length} productos...`);

    const promises = context.candidates.map(async (candidate) => {
      const prompt = `
      Producto: "${candidate.name}" en el nicho "${candidate.category}".
      Simula una búsqueda en AliExpress o Alibaba. Devuelve una evaluación del mejor proveedor posible empacada en un JSON exacto:
      {
        "supplier": {
          "platform": "AliExpress o Alibaba",
          "price": 0.00,
          "reliability": "alta", // "alta", "media" o "baja"
          "url": "https://es.aliexpress.com/item/simulado_o_real.html"
        }
      }
      Solo devuelve el objeto JSON, sin markdown tags.
      `;

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Eres un experto en sourcing desde China.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
        });

        const content = response.choices[0].message.content || '{}';
        const jsonMatch = content.match(/\{[\s\S]*\}/) ? content.match(/\{[\s\S]*\}/)![0] : content;
        const parsed = JSON.parse(jsonMatch);
        
        // Construct a real search URL if the agent gave us a placeholder or generic one
        let finalUrl = parsed.supplier?.url;
        if (!finalUrl || finalUrl.includes('simulado_o_real.html')) {
          const searchTerm = encodeURIComponent(candidate.name as string);
          if (parsed.supplier?.platform?.toLowerCase().includes('alibaba')) {
            finalUrl = `https://www.alibaba.com/showroom/${searchTerm}.html`;
          } else {
            finalUrl = `https://www.aliexpress.com/wholesale?SearchText=${searchTerm}`;
          }
        }

        return { 
          ...candidate, 
          supplier: { 
            ...parsed.supplier,
            url: finalUrl 
          }
        };
      } catch (e) {
        console.error('[Agent: Supplier] Error para', candidate.name);
        return { 
          ...candidate, 
          supplier: { platform: 'Desconocida', price: 99.99, reliability: 'baja' } as any
        };
      }
    });

    return Promise.all(promises);
  }
}
