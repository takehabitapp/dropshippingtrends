import { openai } from '../openai';
import { ProductReview, AgentContext } from './types';

export class CompetitorAgent {
  async run(context: AgentContext): Promise<Partial<ProductReview>[]> {
    console.log(`[Agent: Competitor] Analizando competencia para ${context.candidates.length} productos...`);

    const promises = context.candidates.map(async (candidate) => {
      const prompt = `
      Producto: "${candidate.name}" en el nicho "${candidate.category}".
      Evalúa la saturación en Amazon, eBay y Shopify stores. Devuelve el resultado en JSON sin markdown:
      {
        "competitionLevel": "media" // "baja", "media", "alta"
      }
      `;

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Eres un analista de mercado experto.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
        });

        const content = response.choices[0].message.content || '{}';
        const jsonMatch = content.match(/\{[\s\S]*\}/) ? content.match(/\{[\s\S]*\}/)![0] : content;
        const parsed = JSON.parse(jsonMatch);

        return { ...candidate, competitionLevel: parsed.competitionLevel || 'alta' };
      } catch (e) {
        console.error('[Agent: Competitor] Error para', candidate.name);
        return { ...candidate, competitionLevel: 'alta' } as any;
      }
    });

    return Promise.all(promises);
  }
}
