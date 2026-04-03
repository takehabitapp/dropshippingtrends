import { openai } from '../openai';
import { ProductReview, AgentContext } from './types';

export class ScoringAgent {
  async run(context: AgentContext): Promise<ProductReview[]> {
    console.log(`[Agent: Scoring] Score final y decisión de ${context.candidates.length} productos...`);

    const promises = context.candidates.map(async (candidate) => {
      const prompt = `
      Eres el analista jefe que toma la decisión final sobre productos de dropshipping.
      Tienes estos datos:
      Nombre: ${candidate.name}
      Tendencia: ${candidate.trendStatus}
      Proveedor/Fiabilidad: ${candidate.supplier?.platform} / ${candidate.supplier?.reliability}
      Margen %: ${candidate.estimatedMargin}%
      Competencia: ${candidate.competitionLevel}
      Riesgos: ${candidate.risks?.join(', ')}
      
      Calcula un score final numérico del 0 al 1 (ej: 0.78).
      Y toma una decisión final: "DESCARTAR", "TESTEAR" o "ESCALAR".
      
      Reglas:
      - Margen bajo o competencia muy alta deberías descartar o bajo score.
      - Tendencia creciente + buen margen = testear.
      - Muy buenos números generales = escalar o testear fuerte (alto score).

      Responde SOLO con JSON sin markdown:
      {
        "finalScore": 0.85,
        "finalDecision": "TESTEAR"
      }
      `;

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Eres el Chief Product Officer.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
        });

        const content = response.choices[0].message.content || '{}';
        const jsonMatch = content.match(/\{[\s\S]*\}/) ? content.match(/\{[\s\S]*\}/)![0] : content;
        const parsed = JSON.parse(jsonMatch);

        return { 
          ...candidate, 
          finalScore: parsed.finalScore,
          finalDecision: parsed.finalDecision
        } as ProductReview;
      } catch (e) {
        console.error('[Agent: Scoring] Error para', candidate.name);
        return { 
          ...candidate, 
          finalScore: 0,
          finalDecision: 'DESCARTAR'
        } as ProductReview;
      }
    });

    return Promise.all(promises);
  }
}
