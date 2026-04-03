export interface AgentResult {
  name: string;
  source: string;
  trend: number;
  growth: number;
  saturation: number;
  margin: number;
  metadata?: any;
}

export abstract class BaseAgent {
  abstract name: string;
  abstract run(): Promise<AgentResult[]>;
}
