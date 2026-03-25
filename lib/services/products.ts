const KEYWORDS = ['gadget', 'home', 'fitness', 'pet', 'beauty', 'tech', 'kitchen', 'outdoor', 'toy', 'eco'];

export function generateMockProducts(count: number) {
  const products = [];
  
  for (let i = 0; i < count; i++) {
    const keyword = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
    const trend = Math.floor(Math.random() * 101);
    const growth = Math.floor(Math.random() * 101);
    const saturation = Math.floor(Math.random() * 101);
    const margin = Math.floor(Math.random() * 101);
    
    // Score = (trend * 0.4) + (growth * 0.3) + (margin * 0.2) - (saturation * 0.3)
    let score = (trend * 0.4) + (growth * 0.3) + (margin * 0.2) - (saturation * 0.3);
    score = Math.max(0, Math.min(100, score)); // Clamp between 0 and 100
    
    products.push({
      name: `Trending ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Item ${Math.floor(Math.random() * 1000)}`,
      keyword,
      trend,
      growth,
      saturation,
      margin,
      score: Number(score.toFixed(2)),
      status: 'candidate' as 'candidate' | 'top'
    });
  }
  
  // Sort descending by score
  products.sort((a, b) => b.score - a.score);
  
  // Mark top 10
  for (let i = 0; i < Math.min(10, products.length); i++) {
    products[i].status = 'top';
  }
  
  return products;
}
