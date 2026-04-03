export interface ProductReview {
  name: string;
  category: string;
  trendStatus: 'creciente' | 'estable' | 'bajando';
  supplier: {
    platform: string;
    price: number;
    reliability: 'alta' | 'media' | 'baja';
    url?: string;
  };
  marketPrice: number;
  recommendedPrice: number;
  estimatedMargin: number; // Percentage
  competitionLevel: 'baja' | 'media' | 'alta';
  entryDifficulty: 'baja' | 'media' | 'alta';
  brandingPotential: 'bajo' | 'medio' | 'alto';
  risks: string[];
  finalScore: number; // 0 a 1
  finalDecision: 'DESCARTAR' | 'TESTEAR' | 'ESCALAR';
}

export interface AgentContext {
  query: string;
  candidates: Partial<ProductReview>[];
}
