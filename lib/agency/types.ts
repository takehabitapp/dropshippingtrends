export interface SupplierInfo {
  platform: string;
  price: number;
  reliability: 'alta' | 'media' | 'baja';
  url: string;
  shippingTime?: string;
  rating?: number;
}

export interface DeepAnalysis {
  purchaseRecommendation: string;
  justification: string;
  sources: { name: string; url: string }[];
  riskLevel: 'bajo' | 'medio' | 'alto' | 'crítico';
  profitPotential: string;
}

export interface ProductReview {
  name: string;
  category: string;
  trendStatus: 'creciente' | 'estable' | 'bajando';
  supplier: SupplierInfo; // Primary supplier (kept for backward compatibility or the best one)
  suppliers: SupplierInfo[]; // Multiple providers
  marketPrice: number;
  recommendedPrice: number;
  estimatedMargin: number; // Percentage
  competitionLevel: 'baja' | 'media' | 'alta';
  entryDifficulty: 'baja' | 'media' | 'alta';
  brandingPotential: 'bajo' | 'medio' | 'alto';
  risks: string[];
  finalScore: number; // 0 a 1
  finalDecision: 'DESCARTAR' | 'TESTEAR' | 'ESCALAR';
  deepAnalysis?: DeepAnalysis;
}

export interface AgentContext {
  query: string;
  candidates: Partial<ProductReview>[];
}
