"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Product, Analysis, Creative } from "@/lib/supabase";
import {
  Search,
  Sparkles,
  Image as ImageIcon,
  CheckCircle,

  TrendingUp,
  BarChart2,
  Bookmark,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzingMap, setAnalyzingMap] = useState<Record<string, boolean>>({});
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
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
        const sorted = data.products.sort(
          (a: Product, b: Product) => b.score - a.score
        );
        setProducts(sorted);
        const topProducts = sorted.filter(
          (p: Product) => p.status === "top"
        );
        topProducts.forEach((p: Product) => autoAnalyze(p.id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const autoAnalyze = async (productId: string) => {
    setAnalyzingMap((prev) => ({ ...prev, [productId]: true }));
    try {
      await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ productId }),
        headers: { "Content-Type": "application/json" },
      });
      fetchProducts();
    } finally {
      setAnalyzingMap((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleSaveProduct = async (product: Product) => {
    setSavingMap((prev) => ({ ...prev, [product.id]: true }));
    try {
      await fetch("/api/save", {
        method: "POST",
        body: JSON.stringify({ productId: product.id }),
        headers: { "Content-Type": "application/json" },
      });
      fetchProducts();
    } finally {
      setSavingMap((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const openDetails = async (product: Product) => {
    setActiveProduct(product);
    setActiveAnalysis(null);
    setActiveCreatives([]);
    setModalOpen(true);

    const { data: analysis } = await supabase
      .from("analysis")
      .select("*")
      .eq("product_id", product.id)
      .single();
    const { data: creatives } = await supabase
      .from("creatives")
      .select("*")
      .eq("product_id", product.id);

    setActiveAnalysis(analysis || null);
    setActiveCreatives(creatives || []);
  };

  const toggleExpand = (id: string) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Derived stats ---
  const totalProducts = products.length;
  const topCount = products.filter((p) => p.status === "top").length;
  const analyzedCount = products.filter(
    (p) => p.status === "analyzed" || p.status === "saved"
  ).length;
  const savedCount = products.filter((p) => p.status === "saved").length;
  const analyzingCount = Object.values(analyzingMap).filter(Boolean).length;

  const savedProducts = products.filter((p) => p.status === "saved");
  const otherProducts = products.filter((p) => p.status !== "saved");

  return (
    <div className="space-y-10">
      {/* ── Hero / Action Header ── */}
      <div className="hero-card flex flex-col md:flex-row justify-between items-center gap-6 p-8 rounded-3xl">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">
            Descubrimiento de Productos
          </h2>
          <p className="text-gray-400 text-lg">
            Encuentra y analiza los mejores productos para dropshipping con IA.
          </p>
        </div>
        <button
          onClick={handleExplore}
          disabled={loading}
          className="explore-btn flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-black disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Search size={20} />
          )}
          {loading ? "Explorando la red…" : "Buscar Productos"}
        </button>
      </div>

      {/* ── Metrics Row ── */}
      {totalProducts > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<BarChart2 size={18} />}
            label="Total"
            value={totalProducts}
            color="text-white"
          />
          <MetricCard
            icon={<TrendingUp size={18} />}
            label="Top 10"
            value={topCount + analyzedCount}
            color="text-yellow-400"
          />
          <MetricCard
            icon={
              analyzingCount > 0 ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )
            }
            label={analyzingCount > 0 ? `Analizando (${analyzingCount})` : "Analizados"}
            value={analyzedCount}
            color="text-blue-400"
          />
          <MetricCard
            icon={<Bookmark size={18} />}
            label="Guardados"
            value={savedCount}
            color="text-green-400"
          />
        </div>
      )}

      {/* ── Empty state ── */}
      {products.length === 0 && !loading && (
        <div className="text-center py-24 text-gray-500">
          <Search size={52} className="mx-auto mb-4 opacity-15" />
          <p className="text-xl font-semibold">No hay productos todavía.</p>
          <p className="text-sm mt-2">
            Haz clic en &quot;Buscar Productos&quot; para comenzar.
          </p>
        </div>
      )}

      {/* ── Saved Products Gallery ── */}
      {savedProducts.length > 0 && (
        <section>
          <h3 className="section-title mb-4">
            <Bookmark size={18} className="text-green-400" />
            Productos Guardados
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {savedProducts.map((product) => (
                <SavedCard
                  key={product.id}
                  product={product}
                  onOpen={openDetails}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* ── Main Product List ── */}
      {otherProducts.length > 0 && (
        <section>
          {savedProducts.length > 0 && (
            <h3 className="section-title mb-4">
              <TrendingUp size={18} className="text-purple-400" />
              Exploración Actual
            </h3>
          )}
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence>
              {otherProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="glass product-row rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-white/[0.07] transition-colors"
                >
                  {/* Left info */}
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-base font-bold text-white">
                        {product.name}
                      </h3>
                      <StatusBadge
                        status={product.status}
                        analyzing={analyzingMap[product.id]}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="tag">{product.keyword}</span>
                      <span>
                        Tendencia:{" "}
                        <strong className="text-gray-300">{product.trend}</strong>
                      </span>
                      <span>
                        Crecimiento:{" "}
                        <strong className="text-gray-300">{product.growth}</strong>
                      </span>
                      <span>
                        Saturación:{" "}
                        <strong className="text-gray-300">
                          {product.saturation}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Score + Actions */}
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <ScoreBadge score={product.score} />
                    <div className="flex flex-col gap-2 min-w-[150px]">
                      {["top", "analyzed", "saved"].includes(product.status) && (
                        <button
                          onClick={() => openDetails(product)}
                          className="action-btn action-btn--ghost"
                        >
                          <Sparkles size={14} className="text-purple-400" />
                          Ver Análisis
                        </button>
                      )}
                      {product.status !== "candidate" &&
                        product.status !== "saved" && (
                          <button
                            onClick={() => handleSaveProduct(product)}
                            disabled={
                              savingMap[product.id] ||
                              analyzingMap[product.id]
                            }
                            className="action-btn action-btn--primary"
                          >
                            {savingMap[product.id] ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <ImageIcon size={14} />
                            )}
                            {savingMap[product.id]
                              ? "Generando…"
                              : "Guardar"}
                          </button>
                        )}
                    </div>
                  </div>

                  {/* Expandable mini-metrics */}
                  <button
                    onClick={() => toggleExpand(product.id)}
                    className="hidden md:flex items-center text-gray-600 hover:text-gray-400 transition-colors p-1"
                    aria-label="expand"
                  >
                    {expandedMap[product.id] ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 shadow-2xl border border-white/10"
            >
              {/* Modal header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="text-purple-400" />
                    Análisis de IA
                  </h3>
                  {activeProduct && (
                    <p className="text-gray-400 text-sm mt-1">
                      {activeProduct.name}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {activeAnalysis ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="stat-card">
                      <div className="text-xs text-gray-500 mb-1">
                        Precio Proveedor Est.
                      </div>
                      <div className="text-3xl font-black text-blue-400">
                        ${activeAnalysis.supplier_estimate}
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="text-xs text-gray-500 mb-1">
                        Precio Venta Rec.
                      </div>
                      <div className="text-3xl font-black text-green-400">
                        ${activeAnalysis.price_estimate}
                      </div>
                    </div>
                  </div>

                  <div className="info-block">
                    <h4 className="font-semibold text-white mb-2 text-sm uppercase tracking-wide">
                      Competencia
                    </h4>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {activeAnalysis.competition_summary}
                    </p>
                  </div>

                  <div className="info-block">
                    <h4 className="font-semibold text-white mb-2 text-sm uppercase tracking-wide">
                      Razonamiento
                    </h4>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {activeAnalysis.reasoning}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Loader2 className="w-10 h-10 mb-4 animate-spin opacity-40" />
                  <p>Cargando análisis…</p>
                </div>
              )}

              {/* Creatives */}
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <ImageIcon size={18} className="text-blue-400" />
                  Creatividades DALL·E
                </h3>
                {activeCreatives.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeCreatives.map((c) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={c.id}
                        src={c.image_url}
                        alt="Producto generado"
                        className="w-full h-auto rounded-2xl border border-white/10 object-cover aspect-square"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl p-8 text-center text-gray-600 border border-white/5 border-dashed bg-black/20 text-sm">
                    {activeProduct?.status === "saved"
                      ? "Las imágenes se están generando…"
                      : "Guarda el producto para generar creatividades con DALL·E."}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3">
      <div className={`${color} opacity-80`}>{icon}</div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className={`text-2xl font-black ${color}`}>{value}</div>
      </div>
    </div>
  );
}

function SavedCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: (p: Product) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass rounded-2xl overflow-hidden cursor-pointer group hover:border-green-500/30 transition-all border border-transparent"
      onClick={() => onOpen(product)}
    >
      {/* Placeholder gradient image area */}
      <div className="h-36 bg-gradient-to-br from-green-900/30 to-blue-900/30 flex items-center justify-center relative">
        <ImageIcon size={32} className="text-green-400 opacity-40 group-hover:opacity-70 transition-opacity" />
        <div className="absolute top-2 right-2">
          <span className="text-xs px-2 py-1 rounded-md bg-green-500/20 text-green-400 border border-green-500/30">
            Guardado
          </span>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-white text-sm truncate mb-1">
          {product.name}
        </h4>
        <div className="flex items-center justify-between">
          <span className="tag text-xs">{product.keyword}</span>
          <span className={`text-sm font-black ${product.score > 70 ? "text-green-400" : "text-yellow-400"}`}>
            {product.score.toFixed(0)}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2 group-hover:text-gray-400 transition-colors">
          Ver análisis y creatividades →
        </p>
      </div>
    </motion.div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score > 70 ? "text-green-400" : score > 45 ? "text-yellow-400" : "text-red-400";
  const bg =
    score > 70 ? "border-green-500/20" : score > 45 ? "border-yellow-500/20" : "border-red-500/20";
  return (
    <div
      className={`flex flex-col items-center justify-center bg-black/40 w-16 h-16 rounded-xl border ${bg} shrink-0`}
    >
      <span className="text-[10px] text-gray-500 mb-0.5">Score</span>
      <span className={`text-xl font-black ${color}`}>{score.toFixed(0)}</span>
    </div>
  );
}

function StatusBadge({
  status,
  analyzing,
}: {
  status: string;
  analyzing?: boolean;
}) {
  if (analyzing)
    return (
      <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
        <Loader2 size={10} className="animate-spin" /> Analizando…
      </span>
    );
  if (status === "candidate")
    return (
      <span className="text-xs px-2 py-0.5 rounded-md bg-gray-500/20 text-gray-400 border border-gray-500/30">
        Candidato
      </span>
    );
  if (status === "top")
    return (
      <span className="text-xs px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
        Top 10
      </span>
    );
  if (status === "analyzed")
    return (
      <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
        <CheckCircle size={10} /> Analizado
      </span>
    );
  if (status === "saved")
    return (
      <span className="text-xs px-2 py-0.5 rounded-md bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
        <CheckCircle size={10} /> Guardado
      </span>
    );
  return null;
}

