import { openai } from '../openai';

export async function fetchOpenAIProducts() {
  const prompt = `
  Eres un experto consultor de e-commerce. Tu tarea es identificar 20 productos potenciales de dropshipping que resuelvan problemas reales, tengan una tendencia creciente y baja saturación actualmente.
  
  Responde estrictamente en un formato JSON (una lista de objetos) con la siguiente estructura (sin markdown, solo el JSON):
  [
    {
      "name": "Nombre original del producto",
      "trend": 85, // número 0-100
      "growth": 90, // número 0-100
      "saturation": 15, // número 0-100 (bajo es mejor)
      "margin": 60 // número 0-100 (porcentaje estimado)
    }
  ]
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Eres un estratega experto en selección de productos ganadores.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
    });

    const content = response.choices[0].message.content || '[]';
    // Extract JSON if wrapped in markdown
    const jsonMatch = content.match(/\[[\s\S]*\]/) ? content.match(/\[[\s\S]*\]/)![0] : content;
    
    const products = JSON.parse(jsonMatch);
    
    return products.map((p: any) => ({
      ...p,
      source: 'ai'
    }));
  } catch (error) {
    console.error('Error in OpenAI product generation:', error);
    return [];
  }
}
