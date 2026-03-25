"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Product, Analysis, Creative } from "@/lib/supabase";
import { Search, Sparkles, Image as ImageIcon, CheckCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzingMap, setAnalyzingMap] = useState<Record<string, boolean>>({});
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});
  
  const [activeAnalysis, setActiveAnalysis] = useState<Analysis | null>(null);
  const [activeCreatives, setActiveCreatives] = useState<Creative[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("score", { ascending: false });
    
    if (data && !error) {
      setProducts(data);
    }
  };

  const handleExplore = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/explore", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        // Automatically fetch analysis for top products
        const topProducts = data.products.filter((p: Product) => p.status === "top");
        setProducts(data.products.sort((a: Product, b: Product) => b.score - a.score));
        
        // Fire and forget analysis
        topProducts.forEach((p: Product) => autoAnalyze(p.id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const autoAnalyze = async (productId: string) => {
    setAnalyzingMap(prev => ({ ...prev, [productId]: true }));
    try {
      await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ productId }),
        headers: { "Content-Type": "application/json" }
      });
      // Re-fetch products to update status to "analyzed"
      fetchProducts();
    } finally {
      setAnalyzingMap(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleSaveProduct = async (product: Product) => {
    setSavingMap(prev => ({ ...prev, [product.id]: true }));
    try {
      await fetch("/api/save", {
        method: "POST",
        body: JSON.stringify({ productId: product.id }),
        headers: { "Content-Type": "application/json" }
      });
      fetchProducts();
    } finally {
      setSavingMap(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const openDetails = async (product: Product) => {
    // Fetch analysis and creatives
    const { data: analysis } = await supabase.from("analysis").select("*").eq("product_id", product.id).single();
    const { data: creatives } = await supabase.from("creatives").select("*").eq("product_id", product.id);
    
    setActiveAnalysis(analysis || null);
    setActiveCreatives(creatives || []);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-8 rounded-3xl border border-white/5 shadow-2xl">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
            Descubrimiento de Productos
          </h2>
          <p className="text-gray-400 text-lg">Encuentra y analiza los mejores productos para dropshipping con IA.</p>
        </div>
        <button
          onClick={handleExplore}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:scale-105 active:scale-95"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search size={20} />
          )}
          <span>{loading ? "Explorando la red..." : "Buscar Productos"}</span>
        </button>
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-20 text-gray-500">
          <Search size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-xl">No hay productos descubiertos aún.</p>
          <p className="text-sm mt-2">Haz clic en "Buscar Productos" para comenzar.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {products.map((product) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={product.id}
              className="glass rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors hover:bg-white/[0.08]"
            >
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{product.name}</h3>
                  <StatusBadge status={product.status} />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="bg-black/30 px-3 py-1 rounded-full border border-white/5 capitalize">
                    {product.keyword}
                  </span>
                  <span>Tendencia: <strong className="text-white">{product.trend}</strong></span>
                  <span>Crecimiento: <strong className="text-white">{product.growth}</strong></span>
                </div>
              </div>
              
              <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0">
                <div className="flex flex-col items-center justify-center bg-black/40 w-20 h-20 rounded-2xl border border-white/10">
                  <span className="text-xs text-gray-400 mb-1">Score</span>
                  <span className={`text-2xl font-black ${product.score > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {product.score.toFixed(0)}
                  </span>
                </div>

                <div className="flex flex-col gap-2 min-w-[160px]">
                  {['top', 'analyzed', 'saved'].includes(product.status) && (
                    <button
                      onClick={() => openDetails(product)}
                      className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium"
                    >
                      <Sparkles size={16} className="text-purple-400" />
                      Ver Análisis
                    </button>
                  )}
                  {product.status !== 'candidate' && product.status !== 'saved' && (
                    <button
                      onClick={() => handleSaveProduct(product)}
                      disabled={savingMap[product.id] || analyzingMap[product.id]}
                      className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-medium shadow-lg disabled:opacity-50"
                    >
                      {savingMap[product.id] ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ImageIcon size={16} />
                      )}
                      Guardar
                    </button>
                  )}
                  {product.status === 'saved' && (
                    <div className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 text-sm font-medium">
                      <CheckCircle size={16} />
                      Guardado
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 shadow-2xl border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="text-purple-400" />
                Análisis de IA
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                ✕
              </button>
            </div>

            {activeAnalysis ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                    <div className="text-sm text-gray-400 mb-1">Precio Proveedor Estimado</div>
                    <div className="text-3xl font-bold text-blue-400">${activeAnalysis.supplier_estimate}</div>
                  </div>
                  <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                    <div className="text-sm text-gray-400 mb-1">Precio Venta Recomendado</div>
                    <div className="text-3xl font-bold text-green-400">${activeAnalysis.price_estimate}</div>
                  </div>
                </div>
                
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <h4 className="font-semibold text-white mb-2">Competencia</h4>
                  <p className="text-gray-300 leading-relaxed">{activeAnalysis.competition_summary}</p>
                </div>
                
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <h4 className="font-semibold text-white mb-2">Razonamiento</h4>
                  <p className="text-gray-300 leading-relaxed">{activeAnalysis.reasoning}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Clock className="w-12 h-12 mb-4 opacity-50" />
                <p>El análisis está en proceso o no está disponible.</p>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="text-blue-400" />
                Creatividades Generadas
              </h3>
              {activeCreatives.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeCreatives.map(c => (
                     // eslint-disable-next-line @next/next/no-img-element
                    <img key={c.id} src={c.image_url} alt="Producto" className="w-full h-auto rounded-2xl border border-white/10 object-cover aspect-square" />
                  ))}
                </div>
              ) : (
                <div className="bg-black/20 rounded-2xl p-8 text-center text-gray-500 border border-white/5 border-dashed">
                  No hay imágenes generadas. Guarda el producto para generar creatividades.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'candidate') return <span className="text-xs px-2 py-1 rounded-md bg-gray-500/20 text-gray-400 border border-gray-500/30">Candidato</span>;
  if (status === 'top') return <span className="text-xs px-2 py-1 rounded-md bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Top 10</span>;
  if (status === 'analyzed') return <span className="text-xs px-2 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">Analizado</span>;
  if (status === 'saved') return <span className="text-xs px-2 py-1 rounded-md bg-green-500/20 text-green-400 border border-green-500/30">Guardado</span>;
  return null;
}
