import { openai } from '../openai';
import { ProductReview, AgentContext } from './types';

export class TrendsAgent {
  async run(context: AgentContext): Promise<Partial<ProductReview>[]> {
    console.log(`[Agent: Trends] Experto en Tendencias analizando nicho: ${context.query}`);

    const prompt = `
    Actúa como un experto estratega de producto con +5 años detectando productos ganadores en TikTok, Meta Ads Library y Google Trends.
    Para el nicho "${context.query}", identifica de 3 a 5 productos con alto potencial de viralidad y baja saturación actual.
    
    No des nombres genéricos. Busca variaciones específicas o productos con un "wow factor" claro.
    
    Formato JSON exacto:
    [
      { 
        "name": "Nombre específico (ej: Lámpara de Proyección de Astronauta con Control App)", 
        "category": "${context.query}", 
        "trendStatus": "creciente", // "creciente", "estable"
        "demandValidation": "Alta tracción en TikTok (+1M views en 24h)",
        "saturationLevel": "Baja (pocos competidores en Meta Ads)"
      }
    ]
    Solo responde con el array JSON crudo.
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un analista senior de tendencias de mercado global.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
      });

      const content = response.choices[0].message.content || '[]';
      const jsonMatch = content.match(/\[[\s\S]*\]/) ? content.match(/\[[\s\S]*\]/)![0] : content;

      const parsed = JSON.parse(jsonMatch);
      // Ensure specific fields are included or handled
      return parsed.slice(0, 5).map((p: any) => ({
        ...p,
        risks: [p.saturationLevel].filter(Boolean)
      })) as Partial<ProductReview>[];
    } catch (e: any) {
      console.error('[Agent: Trends] Error:', e.message);
      return [];
    }
  }
}
