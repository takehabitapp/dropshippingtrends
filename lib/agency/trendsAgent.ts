import { openai } from '../openai';
import { ProductReview, AgentContext } from './types';

// Agente de tendencias:
// Analiza tendencias desde TikTok, Instagram, Google Trends
// Detecta productos emergentes y su nivel de crecimiento
// Output: lista de productos candidatos
export class TrendsAgent {
  async run(context: AgentContext): Promise<Partial<ProductReview>[]> {
    console.log(`[Agent: Trends] Investigando mercado para la categoría: ${context.query}`);

    const prompt = `
    Eres un experto cazador de tendencias en dropshipping, usando datos de TikTok, Instagram Reels y Google Trends.
    Para el nicho/búsqueda "${context.query}", devuelve exactamente un array JSON de 3 a 5 productos MUY virales y de alta tendencia actualmente.
    Formato estricto:
    [
      { "name": "Nombre exacto del producto (ej: Leggings Push Up Sin Costuras)", "category": "${context.query}", "trendStatus": "creciente" }
    ]
    Solo responde con el array en JSON crudo, sin markdown tags.
    `;

    const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini', // changed to mini for widespread access
      messages: [
        { role: 'system', content: 'You are an advanced dropshipping trends analyst.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
    });

    const content = response.choices[0].message.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/) ? content.match(/\[[\s\S]*\]/)![0] : content;
    
    try {
      const parsed = JSON.parse(jsonMatch);
      // Validar mínimamente
      return parsed.slice(0, 5) as Partial<ProductReview>[];
    } catch (e: any) {
      console.error('[Agent: Trends] Error parseando JSON de OpenAI. Contenido:', content, 'Error:', e.message);
      return [];
    }
  }
}
