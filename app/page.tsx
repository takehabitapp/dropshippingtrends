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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [searchProducts, setSearchProducts] = useState<ProductReview[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [top20Products, setTop20Products] = useState<ProductReview[]>([]);
  const [loadingTop20, setLoadingTop20] = useState(false);

  const [openSection, setOpenSection] = useState<'search' | 'top20' | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoadingSearch(true);
    setSearchProducts([]);
    
    try {
      const res = await fetch("/api/explore", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      
      const data = await res.json();
      if (data.success && data.products) {
        setSearchProducts(data.products);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleTop20 = async () => {
    setLoadingTop20(true);
    setTop20Products([]);
    
    try {
      const res = await fetch("/api/top20", { 
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      const data = await res.json();
      if (data.success && data.products) {
        setTop20Products(data.products);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTop20(false);
    }
  };

  const toggleSection = (section: 'search' | 'top20') => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* ── Main Header ── */}
      <div className="text-center mb-10 pt-8">
        <h2 className="text-5xl font-black gradient-text tracking-tighter mb-4">
          DropshippingTrends Tops
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Sistema Multi-Agente Avanzado. Expande las secciones abajo para iniciar un análisis profundo sin limitaciones de tiempo, priorizando calidad sobre velocidad.
        </p>
      </div>

      {/* ── Section 1: Producto Buscado ── */}
      <div className="glass rounded-3xl overflow-hidden border border-white/5 transition-all">
        <button 
          onClick={() => toggleSection('search')} 
          className="w-full flex items-center justify-between p-6 bg-black/20 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
              <Search size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white">Análisis: Producto Buscado</h3>
          </div>
          {openSection === 'search' ? <ChevronUp size={24} className="text-gray-400" /> : <ChevronDown size={24} className="text-gray-400" />}
        </button>

        <AnimatePresence>
          {openSection === 'search' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 border-t border-white/5 space-y-8">
                
                {/* Search Bar */}
                <div className="flex flex-col md:flex-row w-full gap-4 bg-black/40 p-6 rounded-2xl border border-white/5">
                  <input 
                    type="text" 
                    placeholder="Ej: streetwear, gym wear mujer..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={loadingSearch}
                    className="flex-1 bg-transparent border-b border-white/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-lg"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loadingSearch || !query.trim()}
                    className="explore-btn flex items-center justify-center gap-3 px-8 py-4 rounded-full font-semibold text-black disabled:opacity-50 whitespace-nowrap"
                  >
                    {loadingSearch ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Sparkles size={20} />
                    )}
                    {loadingSearch ? "Analizando mercado..." : "Buscar productos"}
                  </button>
                </div>
                
                {loadingSearch && (
                  <div className="text-purple-400 text-sm flex items-center justify-center animate-pulse py-4">
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Los agentes están evaluando tendencias, logística, proveedores y competencia. Por favor espera...
                  </div>
                )}

                {/* Search Results */}
                <div className="grid grid-cols-1 gap-6">
                  {searchProducts.map((product, idx) => (
                    <DetailedProductCard key={idx} product={product} />
                  ))}
                  {searchProducts.length === 0 && !loadingSearch && (
                    <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                      <Search size={40} className="mx-auto mb-4 opacity-15" />
                      <p>Ingresa un producto o nicho para análisis detallado.</p>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* ── Section 2: Top 20 Mejor Calificados ── */}
      <div className="glass rounded-3xl overflow-hidden border border-white/5 transition-all">
        <button 
          onClick={() => toggleSection('top20')} 
          className="w-full flex items-center justify-between p-6 bg-black/20 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white">Top 20 Moda: Mejor Calificados</h3>
          </div>
          {openSection === 'top20' ? <ChevronUp size={24} className="text-gray-400" /> : <ChevronDown size={24} className="text-gray-400" />}
        </button>

        <AnimatePresence>
          {openSection === 'top20' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 border-t border-white/5 space-y-6">
                
                <div className="flex justify-between items-center bg-black/40 p-5 rounded-2xl border border-white/5">
                  <p className="text-gray-400 text-sm max-w-lg">
                     Genera un Top 20 en tiempo real centrado en dropshipping de moda. Los agentes analizarán 20 productos de forma masiva (sin validación de logística frágil, asumiendo ropa).
                  </p>
                  <button
                    onClick={handleTop20}
                    disabled={loadingTop20}
                    className="explore-btn--yellow flex items-center justify-center gap-3 px-6 py-3 rounded-full font-bold text-black disabled:opacity-50 whitespace-nowrap bg-yellow-400 hover:bg-yellow-300 transition-colors"
                  >
                    {loadingTop20 ? <Loader2 size={18} className="animate-spin" /> : <BarChart2 size={18} />}
                    {loadingTop20 ? "Analizando mercado..." : "Generar Top 20"}
                  </button>
                </div>

                {loadingTop20 && (
                  <div className="text-yellow-400 text-sm flex items-center justify-center animate-pulse py-4">
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Compilando la lista maestra de 20 productos. Esto requiere procesamiento intensivo...
                  </div>
                )}

                {/* Top 20 Results */}
                {top20Products.length > 0 && (
                  <div className="bg-black/30 rounded-2xl border border-white/10 p-2 overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="text-gray-500 border-b border-white/5 uppercase text-xs">
                        <tr>
                          <th className="p-4 font-semibold pb-4">#</th>
                          <th className="p-4 font-semibold pb-4">Producto</th>
                          <th className="p-4 font-semibold pb-4">Proveedor</th>
                          <th className="p-4 font-semibold pb-4">Precio P.</th>
                          <th className="p-4 font-semibold pb-4">Margen</th>
                          <th className="p-4 font-semibold pb-4">Score</th>
                          <th className="p-4 font-semibold pb-4">Decisión</th>
                        </tr>
                      </thead>
                      <tbody>
                        {top20Products.map((p, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 font-black text-gray-500">{idx + 1}</td>
                            <td className="p-4">
                              <div className="font-bold text-white truncate max-w-[200px]" title={p.name}>{p.name}</div>
                              <div className="text-xs text-gray-500">{p.category} • {p.trendStatus}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-gray-300">{p.supplier?.platform || '-'}</div>
                              <div className={`text-xs ${p.supplier?.reliability === 'alta' ? 'text-green-400' : 'text-yellow-400'}`}>
                                {p.supplier?.reliability || 'Media'}
                              </div>
                              {p.supplier?.url && (
                                <div className="mt-1">
                                  <a href={p.supplier.url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 text-[10px] underline">Ver en proveedor</a>
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-blue-400 font-medium">
                               ${p.supplier?.price?.toFixed(2) || '0.00'}
                            </td>
                            <td className="p-4 text-green-400 font-medium">
                               {p.estimatedMargin}%
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-md bg-black border ${p.finalScore >= 0.7 ? 'border-green-500 text-green-400' : p.finalScore >= 0.5 ? 'border-yellow-500 text-yellow-400' : 'border-red-500 text-red-500'} font-bold`}>
                                {p.finalScore?.toFixed(2)}
                              </span>
                            </td>
                            <td className="p-4">
                              <DecissionBadge decision={p.finalDecision} small />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {top20Products.length === 0 && !loadingTop20 && (
                  <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                    <TrendingUp size={40} className="mx-auto mb-4 opacity-15" />
                    <p>Haz clic en Generar para iniciar el análisis profundo.</p>
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

// ── Components ──────────────────────────────────────────────────────────────

function DetailedProductCard({ product }: { product: ProductReview }) {
  return (
    <div className="bg-black/40 rounded-2xl p-6 flex flex-col gap-5 border border-white/10 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
      <div className={`absolute -right-20 -top-20 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none transition-colors ${product.finalDecision === 'ESCALAR' ? 'bg-green-500' : product.finalDecision === 'TESTEAR' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-gray-400">
              {product.category}
            </span>
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-gray-400 flex items-center gap-1">
              <Activity size={12} className="text-purple-400" />
              Tendencia: <strong className="text-white capitalize">{product.trendStatus}</strong>
            </span>
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-gray-400 flex items-center gap-1">
              <BarChart2 size={12} className="text-green-400" />
              Margen: <strong className="text-white capitalize">{product.estimatedMargin}%</strong>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <DecissionBadge decision={product.finalDecision} />
            <div className="flex flex-col items-center justify-center bg-black/60 w-16 h-16 rounded-xl border border-white/10 shrink-0">
              <span className="text-[10px] text-gray-500 mb-0.5">Score</span>
              <span className={`text-lg font-black ${product.finalScore >= 0.7 ? "text-green-400" : product.finalScore >= 0.5 ? "text-yellow-400" : "text-red-400"}`}>
                {product.finalScore?.toFixed(2)}
              </span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 mt-2 p-4 bg-white/5 rounded-xl border border-white/5">
        
        <div className="space-y-1 text-sm">
          <div className="font-semibold text-gray-400 flex items-center gap-1.5 mb-2"><Package size={14}/> Proveedor</div>
          <div className="flex justify-between"><span className="text-gray-500">Plat:</span> <span className="text-gray-300">{product.supplier?.platform || '-'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Precio:</span> <span className="text-blue-400">${product.supplier?.price?.toFixed(2) || '0.00'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Fiab:</span> <span className="text-gray-300 capitalize">{product.supplier?.reliability || '-'}</span></div>
          {product.supplier?.url && (
            <div className="flex justify-end mt-2">
              <a href={product.supplier.url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 text-xs underline">
                Ir al enlace de venta
              </a>
            </div>
          )}
        </div>

        <div className="space-y-1 text-sm">
          <div className="font-semibold text-gray-400 flex items-center gap-1.5 mb-2"><TrendingUp size={14}/> Econ & Mercado</div>
          <div className="flex justify-between"><span className="text-gray-500">P. Venta Rec:</span> <span className="text-green-400">${product.recommendedPrice?.toFixed(2) || '0.00'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Competencia:</span> <span className="text-gray-300 capitalize">{product.competitionLevel}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Dif. Entrada:</span> <span className="text-gray-300 capitalize">{product.entryDifficulty}</span></div>
        </div>

        <div className="space-y-1 text-sm border-l-0 md:border-l pl-0 md:pl-4 border-white/10">
           <div className="font-semibold text-orange-400 flex items-center gap-1.5 mb-2"><AlertTriangle size={14}/> Riesgos / Notas</div>
           {product.risks && product.risks.length > 0 ? (
              <ul className="list-disc pl-4 text-orange-200 text-xs space-y-1">
                {product.risks.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            ) : (
              <span className="text-gray-500 text-xs italic">Sin riesgos mayores.</span>
            )}
        </div>

      </div>
    </div>
  );
}

function DecissionBadge({ decision, small = false }: { decision: string, small?: boolean }) {
  const p = small ? "px-2 py-1 text-xs" : "px-4 py-2 text-sm";
  const iconSize = small ? 12 : 16;
  
  if (decision === "ESCALAR") {
    return (
      <div className={`${p} rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 font-bold tracking-widest flex items-center gap-2`}>
        <CheckCircle size={iconSize} /> ESCALAR
      </div>
    );
  }
  if (decision === "TESTEAR") {
    return (
      <div className={`${p} rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-bold tracking-widest flex items-center gap-2`}>
        <Sparkles size={iconSize} /> TESTEAR
      </div>
    );
  }
  return (
    <div className={`${p} rounded-xl bg-red-500/20 border border-red-500/40 text-red-500 font-bold tracking-widest flex items-center gap-2`}>
      <AlertTriangle size={iconSize} /> DESCARTAR
    </div>
  );
}
