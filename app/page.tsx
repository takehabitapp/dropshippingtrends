"use client";

import { useState } from "react";
import { ProductReview } from "@/lib/agency/types";
import {
  Search,
  Sparkles,
  TrendingUp,
  BarChart2,
  AlertTriangle,
  Package,
  Activity,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(false);

  const handleExplore = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setProducts([]);
    
    try {
      const res = await fetch("/api/explore", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* ── Hero / Action Header ── */}
      <div className="hero-card flex flex-col justify-center items-center gap-6 p-10 rounded-3xl text-center">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-4">
            Dropshipping Deep Analysis
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Sistema Multi-Agente Avanzado. Encuentra oportunidades reales de mercado basadas en validación profunda.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row w-full max-w-xl gap-4 mt-4">
          <input 
            type="text" 
            placeholder="Ej: streetwear, gym wear mujer..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="flex-1 bg-black/40 border border-white/10 rounded-full px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleExplore()}
          />
          <button
            onClick={handleExplore}
            disabled={loading || !query.trim()}
            className="explore-btn flex items-center justify-center gap-3 px-8 py-4 rounded-full font-semibold text-black disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Search size={20} />
            )}
            {loading ? "Analizando mercado..." : "Buscar productos"}
          </button>
        </div>
        
        {loading && (
          <div className="text-purple-400 text-sm flex items-center justify-center mt-2 animate-pulse">
            <Sparkles size={16} className="mr-2" />
            Ejecutando agencia de analistas. Este proceso toma su tiempo para garantizar la calidad...
          </div>
        )}
      </div>

      {/* ── Empty state ── */}
      {products.length === 0 && !loading && (
        <div className="text-center py-24 text-gray-500">
          <Search size={52} className="mx-auto mb-4 opacity-15" />
          <p className="text-xl font-semibold">Esperando término de búsqueda.</p>
          <p className="text-sm mt-2">
            Ingresa un nicho para que los agentes hagan el análisis.
          </p>
        </div>
      )}

      {/* ── Main Product List ── */}
      {products.length > 0 && (
        <section>
          <h3 className="section-title mb-6 text-xl">
            <TrendingUp size={24} className="text-purple-400 mr-2" />
            Resultados del Análisis
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {products.map((product, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="glass rounded-3xl p-6 lg:p-8 flex flex-col gap-6 relative overflow-hidden"
                >
                  {/* Decorative Gradient Background based on decision */}
                  <div className={`absolute -right-40 -top-40 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none ${product.finalDecision === 'ESCALAR' ? 'bg-green-500' : product.finalDecision === 'TESTEAR' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>

                  {/* Header Row */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {product.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-300">
                          {product.category}
                        </span>
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-300 flex items-center gap-1">
                          <Activity size={14} className="text-purple-400" />
                          Tendencia: <strong className="text-white">{product.trendStatus}</strong>
                        </span>
                      </div>
                    </div>
                    
                    {/* Score & Badge */}
                    <div className="flex items-center gap-4">
                       <DecissionBadge decision={product.finalDecision} />
                       <div className="flex flex-col items-center justify-center bg-black/40 w-20 h-20 rounded-2xl border border-white/10 shrink-0">
                         <span className="text-xs text-gray-500 mb-0.5">Score</span>
                         <span className={`text-2xl font-black ${product.finalScore >= 0.7 ? "text-green-400" : product.finalScore >= 0.5 ? "text-yellow-400" : "text-red-400"}`}>
                           {product.finalScore.toFixed(2)}
                         </span>
                       </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

                  {/* Data Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                    
                    {/* Block 1: Supplier */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Package size={16} /> Proveedor
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex justify-between">
                          <span className="text-gray-500">Plataforma:</span>
                          <span className="font-medium text-white">{product.supplier?.platform || "No datos"}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-500">Precio Proveedor:</span>
                          <span className="font-medium text-blue-400">${product.supplier?.price?.toFixed(2) || "0.00"}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-500">Fiabilidad:</span>
                          <span className="font-medium capitalize text-white">{product.supplier?.reliability || "-"}</span>
                        </li>
                      </ul>
                    </div>

                    {/* Block 2: Economics */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <BarChart2 size={16} /> Margen & Pricing
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex justify-between">
                          <span className="text-gray-500">P. Mercado:</span>
                          <span className="font-medium text-white">${product.marketPrice?.toFixed(2) || "0.00"}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-500">P. Recomendado:</span>
                          <span className="font-medium text-green-400">${product.recommendedPrice?.toFixed(2) || "0.00"}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-500">Margen Estimado:</span>
                          <span className="font-medium text-yellow-400">{product.estimatedMargin}%</span>
                        </li>
                      </ul>
                    </div>

                    {/* Block 3: Market */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp size={16} /> Competencia
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex justify-between">
                          <span className="text-gray-500">Nivel Competencia:</span>
                          <span className="font-medium capitalize text-white">{product.competitionLevel}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-500">Dificultad Entrada:</span>
                          <span className="font-medium capitalize text-white">{product.entryDifficulty}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-500">Potencial Branding:</span>
                          <span className="font-medium capitalize text-white">{product.brandingPotential}</span>
                        </li>
                      </ul>
                    </div>

                    {/* Block 4: Risks */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 text-orange-400">
                        <AlertTriangle size={16} /> Riesgos Detectados
                      </h4>
                      <div className="text-sm text-gray-300 bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl h-[90%] overflow-y-auto">
                        {product.risks && product.risks.length > 0 ? (
                          <ul className="list-disc pl-4 space-y-1 text-orange-200">
                            {product.risks.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        ) : (
                          <span className="text-gray-500 italic">Ninguno detectado.</span>
                        )}
                      </div>
                    </div>

                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

    </div>
  );
}

// ── Components ──────────────────────────────────────────────────────────────

function DecissionBadge({ decision }: { decision: string }) {
  if (decision === "ESCALAR") {
    return (
      <div className="px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 font-bold tracking-widest text-sm flex items-center gap-2">
        <CheckCircle size={16} /> ESCALAR
      </div>
    );
  }
  if (decision === "TESTEAR") {
    return (
      <div className="px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-bold tracking-widest text-sm flex items-center gap-2">
        <Sparkles size={16} /> TESTEAR
      </div>
    );
  }
  return (
    <div className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-500 font-bold tracking-widest text-sm flex items-center gap-2">
      <AlertTriangle size={16} /> DESCARTAR
    </div>
  );
}
