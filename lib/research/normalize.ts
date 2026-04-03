export function normalizeProducts(allProducts: any[]) {
  const seenNames = new Set();
  const normalized: any[] = [];

  for (const product of allProducts) {
    // Basic deduplication and cleanup
    const cleanName = product.name.trim().toLowerCase();
    if (seenNames.has(cleanName)) continue;
    seenNames.add(cleanName);

    // Ensure all fields exist with defaults
    const name = product.name.trim();
    const source = product.source || 'unknown';
    const trend = Math.min(100, Math.max(0, product.trend || 50));
    const growth = Math.min(100, Math.max(0, product.growth || 50));
    const saturation = Math.min(100, Math.max(0, product.saturation || 50));
    const margin = Math.min(100, Math.max(0, product.margin || 50));

    // Simple keyword categorization (could be more robust)
    const keyword = detectKeyword(name);

    // Calculate score = (trend * 0.4) + (growth * 0.3) + (margin * 0.2) - (saturation * 0.3)
    let score = (trend * 0.4) + (growth * 0.3) + (margin * 0.2) - (saturation * 0.3);
    score = Math.max(0, Math.min(100, score));

    normalized.push({
      name,
      keyword,
      source,
      trend,
      growth,
      saturation,
      margin,
      score: Number(score.toFixed(2)),
      status: 'candidate'
    });
  }

  // Sort by score descending and limit to 100
  normalized.sort((a, b) => b.score - a.score);
  
  // Mark top candidates from the research
  const result = normalized.slice(0, 100);
  for (let i = 0; i < Math.min(10, result.length); i++) {
    result[i].status = 'top';
  }

  return result;
}

function detectKeyword(name: string): string {
  const categories = ['gadget', 'home', 'fitness', 'pet', 'beauty', 'tech', 'kitchen', 'outdoor', 'toy', 'eco'];
  const nameLower = name.toLowerCase();
  
  for (const cat of categories) {
    if (nameLower.includes(cat)) return cat;
  }
  
  // Pick one based on common terms or default to generic
  if (nameLower.includes('light') || nameLower.includes('lamp')) return 'home';
  if (nameLower.includes('dog') || nameLower.includes('cat')) return 'pet';
  if (nameLower.includes('face') || nameLower.includes('skin')) return 'beauty';
  if (nameLower.includes('cooking') || nameLower.includes('pan')) return 'kitchen';
  
  return categories[Math.floor(Math.random() * categories.length)];
}
