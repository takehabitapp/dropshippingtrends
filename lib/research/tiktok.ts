export async function fetchTikTokViralProducts() {
  // Mock list of currently viral TikTok products for MVP
  const viralProducts = [
    { name: 'Crystal Hair Eraser', trend: 95, growth: 85, saturation: 70, margin: 80 },
    { name: 'Portable Blender Jet', trend: 90, growth: 75, saturation: 60, margin: 65 },
    { name: 'Sunset Lamp Projector', trend: 85, growth: 60, saturation: 80, margin: 70 },
    { name: 'Electric Jar Opener', trend: 78, growth: 92, saturation: 30, margin: 55 },
    { name: 'Pet Hair Remover Roller', trend: 92, growth: 88, saturation: 50, margin: 75 },
    { name: 'Neck Cloud Stretcher', trend: 88, growth: 95, saturation: 40, margin: 60 },
    { name: 'Flame Aroma Diffuser', trend: 94, growth: 82, saturation: 55, margin: 68 },
    { name: 'Digital Measuring Spoon', trend: 75, growth: 70, saturation: 20, margin: 50 },
    { name: 'Silicone Stretch Lids', trend: 70, growth: 65, saturation: 45, margin: 40 },
    { name: 'Cleaning Slime Gel', trend: 82, growth: 78, saturation: 65, margin: 55 }
  ];

  return viralProducts.map(p => ({
    ...p,
    source: 'tiktok'
  }));
}
