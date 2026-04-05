import { openai } from '../openai';
import { ProductReview, AgentContext, SupplierInfo } from './types';

export class SupplierAgent {
  async run(context: AgentContext): Promise<Partial<ProductReview>[]> {
    console.log(`[Agent: Supplier] Experto en Sourcing buscando proveedores para ${context.candidates.length} productos...`);

    const promises = context.candidates.map(async (candidate) => {
      const prompt = `
      Actúa como un experto en sourcing internacional con +10 años de experiencia.
      Producto: "${candidate.name}" en el nicho "${candidate.category}".
      
      Tu objetivo es encontrar y comparar de 3 a 4 proveedores reales o simulados de alta calidad en las siguientes plataformas:
      AliExpress, Alibaba, CJdropshipping, 1688 y Amazon (opcional).
      
      Debes devolver un array de proveedores ordenados por relevancia (el mejor primero) en un JSON exacto:
      {
        "suppliers": [
          {
            "platform": "AliExpress | Alibaba | CJdropshipping | 1688",
            "price": 0.00,
            "reliability": "alta | media | baja",
            "shippingTime": "7-12 días",
            "rating": 4.8,
            "url": "dejalo vacio si no tienes uno real, yo lo generaré"
          }
        ]
      }
      
      Criterios de experto:
      - Alibaba: para compras al por mayor (>50 unidades).
      - AliExpress/CJ: para dropshipping directo.
      - 1688: el precio debe ser un 30-50% más bajo que AliExpress pero en CNY (convierte a USD).
      
      Solo devuelve el objeto JSON, sin markdown tags.
      `;

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Eres un experto en sourcing internacional y cadena de suministro.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
        });

        const content = response.choices[0].message.content || '{}';
        const jsonMatch = content.match(/\{[\s\S]*\}/) ? content.match(/\{[\s\S]*\}/)![0] : content;
        const parsed = JSON.parse(jsonMatch);

        let suppliers: SupplierInfo[] = parsed.suppliers || [];

        // Post-process suppliers to ensure valid URLs and add fallbacks if empty
        const processedSuppliers: SupplierInfo[] = suppliers.map(s => {
          const searchTerm = encodeURIComponent(candidate.name as string);
          let url = s.url;

          // Normalize reliability safely
          let reliability: 'alta' | 'media' | 'baja' = 'media';
          if (s.reliability === 'alta' || s.reliability === 'media' || s.reliability === 'baja') {
            reliability = s.reliability;
          }

          if (!url || url === "" || url.includes('simulado')) {
            const platform = s.platform.toLowerCase();
            if (platform.includes('alibaba')) {
              url = `https://www.alibaba.com/trade/search?SearchText=${searchTerm}`;
            } else if (platform.includes('aliexpress')) {
              url = `https://www.aliexpress.com/wholesale?SearchText=${searchTerm}`;
            } else if (platform.includes('cj')) {
              url = `https://cjdropshipping.com/product-list?search=${searchTerm}`;
            } else if (platform.includes('1688')) {
              url = `https://s.1688.com/youyuan/index.htm?keywords=${searchTerm}`;
            } else if (platform.includes('amazon')) {
              url = `https://www.amazon.com/s?k=${searchTerm}`;
            } else {
              url = `https://www.google.com/search?q=${searchTerm}+supplier`;
            }
          }
          return { ...s, reliability, url };
        });

        // If no suppliers returned by AI, provide a robust fallback
        if (processedSuppliers.length === 0) {
          const searchTerm = encodeURIComponent(candidate.name as string);
          processedSuppliers.push({
            platform: 'AliExpress',
            price: 15.00,
            reliability: 'media',
            shippingTime: '10-15 días',
            url: `https://www.aliexpress.com/wholesale?SearchText=${searchTerm}`
          });
          processedSuppliers.push({
            platform: 'Alibaba',
            price: 8.50,
            reliability: 'alta',
            shippingTime: '15-25 días',
            url: `https://www.alibaba.com/trade/search?SearchText=${searchTerm}`
          });
        }

        return {
          ...candidate,
          supplier: processedSuppliers[0], // Set the first one as primary
          suppliers: processedSuppliers
        } as Partial<ProductReview>;
      } catch (e) {
        console.error('[Agent: Supplier] Error para', candidate.name, e);
        const searchTerm = encodeURIComponent(candidate.name as string);
        const fallbackSupplier: SupplierInfo = {
          platform: 'AliExpress',
          price: 15.00,
          reliability: 'media',
          url: `https://www.aliexpress.com/wholesale?SearchText=${searchTerm}`
        };
        return {
          ...candidate,
          supplier: fallbackSupplier,
          suppliers: [fallbackSupplier]
        } as Partial<ProductReview>;
      }
    });

    return Promise.all(promises);
  }
}
