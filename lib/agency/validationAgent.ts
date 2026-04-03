import { openai } from '../openai';
import { ProductReview, AgentContext } from './types';

// Agente de validación de producto
// Filtra productos según: Potencial de venta, Facilidad logística, Problema que resuelve
// Elimina productos inviables
export class ValidationAgent {
  async run(context: AgentContext): Promise<Partial<ProductReview>[]> {
    console.log(`[Agent: Validation] Evaluando logística y resolución del problema de ${context.candidates.length} candidatos...`);

    const validProducts: Partial<ProductReview>[] = [];

    // Validar en paralelo para mejor performance, pero asegurando calidad
    const validations = context.candidates.map(async (candidate) => {
      const prompt = `
      El producto propuesto es: "${candidate.name}" en el nicho de "${candidate.category}".
      Evalúa su potencial de venta y facilidad logística (peso, electrónica frágil, problemas en aduanas) y si resuelve un dolor real al cliente.
      Responde estrictamente con un JSON sin markdown:
      {
        "isValid": true/false,
        "risks": ["Riesgo 1", "Riesgo 2"] // Obligatorio agregar mínimo 1 riesgo
      }
      Manten los estándares altos: descarta productos grandes, frágiles, con líquidos o que no aporten valor real.
      `;

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Eres un analista logístico de e-commerce riguroso.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
        });

        const content = response.choices[0].message.content || '{}';
        const jsonMatch = content.match(/\{[\s\S]*\}/) ? content.match(/\{[\s\S]*\}/)![0] : content;
        const parsed = JSON.parse(jsonMatch);

        if (parsed.isValid) {
          return {
            ...candidate,
            risks: parsed.risks || ['Posible saturación temporal']
          };
        }
        return null;
      } catch (e) {
        console.error('[Agent: Validation] Error con', candidate.name);
        return null;
      }
    });

    const results = await Promise.all(validations);
    
    for (const res of results) {
      if (res) validProducts.push(res);
    }
    
    console.log(`[Agent: Validation] ${validProducts.length} pasaron la validación.`);
    return validProducts;
  }
}
