import { openai } from '../openai';
import { Product } from '../supabase';

export async function generateProductAnalysis(product: Product) {
  const prompt = `
  Analiza el siguiente producto para un negocio de dropshipping:
  Nombre: ${product.name}
  Nicho/Keyword: ${product.keyword}
  Tendencia (0-100): ${product.trend}
  Crecimiento (0-100): ${product.growth}
  Saturación (0-100): ${product.saturation}
  Margen estimado (0-100): ${product.margin}
  Score global: ${product.score}

  Por favor, basándote en esta información y tus conocimientos sobre e-commerce, responde estrictamente en un formato JSON estructurado así (sin markdown, solo el json):
  {
    "competition_summary": "Un breve resumen de la competencia para este producto (máx 3 líneas)",
    "price_estimate": 0.00, // número decimal: el precio de venta recomendado en USD
    "supplier_estimate": 0.00, // número decimal: el costo aproximado en AliExpress/proveedor en USD
    "reasoning": "Tu razonamiento del porqué estos números y si recomiendas venderlo (máx 4 líneas)"
  }
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Eres un experto consultor de e-commerce y dropshipping.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
  });

  const content = response.choices[0].message.content || '{}';
  
  // Extract JSON if wrapped in markdown
  const jsonMatch = content.match(/\\{.*\\}/s) ? content.match(/\\{.*\\}/s)![0] : content;
  
  try {
    return JSON.parse(jsonMatch);
  } catch (e) {
    console.error('Failed to parse OpenAI response:', content);
    throw new Error('Invalid JSON from OpenAI');
  }
}
