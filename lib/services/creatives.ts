import { openai } from '../openai';
import { Product } from '../supabase';

export async function generateProductImage(product: Product): Promise<string[]> {
  const prompt = `Una fotografía de alta calidad, realista, de un producto comercial tipo ecommerce llamado "${product.name}". Es un artículo aplicable a la categoría "${product.keyword}". Fondo limpio tipo estudio, sin texto, estilo anuncio profesional, iluminación óptima y aspecto premium, listo para venderse en una tienda online.`;

  try {
    // Generate 2 images. DALL-E 3 only supports n=1 per request, so we might need 2 calls, or use dall-e-2 for n=2.
    // DALL-E 3 is better quality but slower and 1 per request. Let's use dall-e-3 for 1 high quality image, or dall-e-2 for 2.
    // The requirement says "Generate 2-3 images". We'll loop twice with dall-e-3.
    const urls: string[] = [];
    
    // We'll generate 2 images in parallel
    const promises = Array(2).fill(0).map(() => 
      openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      })
    );
    
    const results = await Promise.all(promises);
    
    results.forEach(res => {
      if (res.data && res.data[0]?.url) {
        urls.push(res.data[0].url);
      }
    });
    
    return urls;
  } catch (error) {
    console.error('Error generating image from DALL-E:', error);
    throw error;
  }
}
