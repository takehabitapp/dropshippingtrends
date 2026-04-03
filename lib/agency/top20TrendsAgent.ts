import { openai } from '../openai';
import { ProductReview, AgentContext } from './types';

export class Top20TrendsAgent {
  async run(count: number = 20): Promise<Partial<ProductReview>[]> {
    console.log(`[Agent: Top20 Trends] Generando lista maestra de ${count} productos ganadores...`);

    const prompt = `
    Eres un analista de dropshipping experto en detectar productos virales y de alta rentabilidad en CUALQUIER categoría (Hogar, Salud, Gadgets, Belleza, Mascotas, etc.).
    Tu objetivo es encontrar los ${count} mejores productos ganadores (winning products) que están explotando en TikTok e Instagram ahora mismo.
    Devuelve EXACTAMENTE ${count} productos empaquetados en un array JSON.
    Formato estricto:
    [
      { "name": "Nombre de producto (ej: Proyector de estrellas galaxia)", "category": "gadgets", "trendStatus": "creciente" },
      ... ${count - 1} más ...
    ]
    Solo responde con el array en JSON crudo, sin markdown tags.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', 
        messages: [
          { role: 'system', content: 'You are an advanced dropshipping fashion analyst.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
      });

      const content = response.choices[0].message.content || '[]';
      const jsonMatch = content.match(/\[[\s\S]*\]/) ? content.match(/\[[\s\S]*\]/)![0] : content;
      
      const parsed = JSON.parse(jsonMatch);
      return parsed.slice(0, count) as Partial<ProductReview>[];
    } catch (e: any) {
      console.error('[Agent: Top20 Trends] Error:', e.message);
      return [];
    }
  }
}
