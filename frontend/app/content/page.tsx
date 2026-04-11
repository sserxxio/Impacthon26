"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MarkdownRenderer from "../components/MarkdownRenderer";

export default function ContentGeneratorPage() {
  const [hotelName, setHotelName] = useState<string | null>(null);
  const [hotelId, setHotelId] = useState<number | null>(null);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"hub" | "marketing" | "reviews" | "reporte">("hub");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  useEffect(() => {
    const storedHotelId = localStorage.getItem("hotelId");
    const storedHotelName = localStorage.getItem("hotelName");

    if (!storedHotelId) {
      router.push("/login");
      return;
    }

    setHotelId(parseInt(storedHotelId));
    setHotelName(storedHotelName || "Hotel");
  }, [router]);

  const handleGenerate = async () => {
    if (!hotelId) return;
    setLoading(true);
    setGeneratedContent(null);

    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: activeTab,
          hotelId: hotelId,
          customInput: inputValue
        }),
      });

      const data = await res.json();
      setGeneratedContent(data.content || "Error al obtener respuesta.");
    } catch (e) {
      setGeneratedContent("Error de conexión con los servidores de IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f4f1] text-[#683110] flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto relative scroll-smooth flex flex-col min-w-0">
        <div className="max-w-4xl mx-auto p-4 md:p-8 w-full">
          <Header hotelName={hotelName} />
          
          <div className="bg-transparent p-8 rounded-2xl border border-[#ae8d6e]/30 mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black mb-2 text-[#683110] italic tracking-tighter uppercase">Inteligencia de Contenidos</h1>
              <p className="text-[#683110]/80 font-medium">
                {activeTab === "hub" 
                  ? "Automatiza reportes, marketing y gestión de clientes utilizando IA Generativa."
                  : "Generador asistido conectado a los datos reales de tu hotel."}
              </p>
            </div>
            {activeTab !== "hub" && (
              <button 
                onClick={() => { setActiveTab("hub"); setGeneratedContent(null); setInputValue(""); }}
                className="bg-[#f5f4f1] border-2 border-[#5e0710] text-[#5e0710] hover:bg-[#5e0710] hover:text-[#f5f4f1] px-5 py-2 rounded-xl font-bold transition-all text-sm uppercase tracking-wider"
              >
                Volver al Hub
              </button>
            )}
          </div>

          {activeTab === "hub" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Tarjeta 1: Marketing / Amenities */}
              <div className="bg-white border border-[#ae8d6e]/30 rounded-[2rem] p-8 shadow-sm hover:border-[#ae8d6e] hover:shadow-xl transition-all group cursor-pointer" onClick={() => setActiveTab("marketing")}>
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform origin-left">📢</div>
                <h2 className="text-2xl font-black italic uppercase text-[#5e0710] mb-2 tracking-tighter">Textos de Marketing</h2>
                <p className="text-[#683110] font-medium mb-8 min-h-[48px]">
                  Genera copies persuasivos para la web y redes sociales basados en las amenities únicas de tu hotel.
                </p>
                <div className="flex items-center text-[#c50000] text-sm font-bold uppercase tracking-widest gap-2">
                  Abrir Generador <span className="text-xl">→</span>
                </div>
              </div>

              {/* Tarjeta 2: Reseñas */}
              <div className="bg-white border border-[#ae8d6e]/30 rounded-[2rem] p-8 shadow-sm hover:border-[#ae8d6e] hover:shadow-xl transition-all group cursor-pointer" onClick={() => setActiveTab("reviews")}>
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform origin-left">✍️</div>
                <h2 className="text-2xl font-black italic uppercase text-[#5e0710] mb-2 tracking-tighter">Gestor de Reseñas</h2>
                <p className="text-[#683110] font-medium mb-8 min-h-[48px]">
                  Pega el feedback o encuestas de tus clientes para redactar automáticamente respuestas empáticas oficiales.
                </p>
                <div className="flex items-center text-[#c50000] text-sm font-bold uppercase tracking-widest gap-2">
                  Abrir Generador <span className="text-xl">→</span>
                </div>
              </div>

              {/* Tarjeta 3: Reportes */}
              <div className="bg-white border border-[#ae8d6e]/30 rounded-[2rem] p-8 shadow-sm hover:border-[#ae8d6e] hover:shadow-xl transition-all group cursor-pointer" onClick={() => setActiveTab("reporte")}>
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform origin-left">📄</div>
                <h2 className="text-2xl font-black italic uppercase text-[#5e0710] mb-2 tracking-tighter">Reportes Ejecutivos</h2>
                <p className="text-[#683110] font-medium mb-8 min-h-[48px]">
                  Genera un resumen directivo en lenguaje natural resumiendo métricas, KPI's de ocupación y alertas financieras.
                </p>
                <div className="flex items-center text-[#c50000] text-sm font-bold uppercase tracking-widest gap-2">
                  Abrir Generador <span className="text-xl">→</span>
                </div>
              </div>

              {/* Tarjeta 4: Estrategias Avanzadas */}
              <div className="bg-gradient-to-br from-[#c50000] to-[#5e0710] border border-[#c50000] rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:shadow-[#c50000]/20 transition-all group cursor-pointer" onClick={() => router.push('/manage')}>
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform origin-left drop-shadow-md">🎯</div>
                <h2 className="text-2xl font-black italic uppercase text-[#f5f4f1] mb-2 tracking-tighter">Estrategias (Velvet)</h2>
                <p className="text-red-100 font-medium mb-8 min-h-[48px]">
                  Accede al panel principal para definir tus estrategias de Revenue y Competencia.
                </p>
                <div className="flex items-center text-white text-sm font-bold uppercase tracking-widest gap-2">
                  Ir al Administrador <span className="text-xl">→</span>
                </div>
              </div>
            </div>
          )}

          {activeTab !== "hub" && (
            <div className="bg-white border border-[#ae8d6e]/30 p-8 md:p-12 rounded-[2.5rem] shadow-xl relative animate-fade-in mb-12">
              <span className="text-xs font-black text-[#ae8d6e] uppercase tracking-[0.3em] mb-4 block">
                {activeTab === "marketing" ? "Promoción y Redes" : activeTab === "reviews" ? "Atención al Cliente" : "C-Level Reports"}
              </span>
              <h2 className="text-3xl lg:text-4xl font-black italic text-[#5e0710] uppercase tracking-tighter mb-8 bg-white pr-4">
                {activeTab === "marketing" && "Redactor de Contenidos"}
                {activeTab === "reviews" && "Asistente de Respuestas"}
                {activeTab === "reporte" && "Sintetizador de Datos"}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase text-[#683110] mb-3 tracking-widest border-l-2 border-[#ae8d6e] pl-3">
                    {activeTab === "marketing" && "Instrucciones Adicionales (Opcional)"}
                    {activeTab === "reviews" && "Pega la reseña del cliente aquí"}
                    {activeTab === "reporte" && "¿Qué foco te interesa? (Opcional)"}
                  </label>
                  <textarea 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                       activeTab === "marketing" ? "Ej: Promocionar nuestro nuevo Cocktail de bienvenida. Tono divertido." :
                       activeTab === "reviews" ? "Ej: La habitación estaba sucia y la recepción ausente..." :
                       "Ej: Analiza solo el impacto de la Ocupación frente al ADR."
                    }
                    className="w-full bg-[#f5f4f1] border border-[#ae8d6e]/50 rounded-2xl px-6 py-4 text-[#5e0710] font-medium placeholder-[#683110]/50 min-h-[120px] focus:outline-none focus:border-[#683110] focus:ring-1 focus:ring-[#683110]/20 transition-all"
                  />
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={loading || (activeTab === "reviews" && !inputValue.trim())}
                  className="w-full bg-[#5e0710] hover:bg-[#c50000] disabled:opacity-50 text-[#f5f4f1] font-black py-5 rounded-2xl transition-all shadow-xl shadow-[#5e0710]/20 uppercase tracking-[0.2em] hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-3"
                >
                  {loading ? (
                    <span className="animate-pulse">Procesando I.A...</span>
                  ) : (
                    <>✨ Generar Resultado</>
                  )}
                </button>
              </div>

              {loading && (
                 <div className="mt-12 py-12 border-t border-[#ae8d6e]/20 text-center animate-pulse">
                    <div className="text-4xl mb-4">🧠</div>
                    <p className="text-[#683110] font-bold uppercase tracking-widest text-sm">Consultando al Oráculo...</p>
                 </div>
              )}

              {generatedContent && !loading && (
                <div className="mt-12 pt-10 border-t border-[#ae8d6e]/30 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f5f4f1] border border-[#ae8d6e] px-4 py-1 rounded-full text-[10px] font-black uppercase text-[#683110] tracking-widest shadow-sm">
                    Resultado Generado
                  </div>
                  <div className="bg-[#f5f4f1]/50 p-8 rounded-3xl border border-[#ae8d6e]/50">
                    <MarkdownRenderer content={generatedContent} />
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(generatedContent)}
                    className="mt-6 w-full bg-white border-2 border-[#5e0710] text-[#5e0710] hover:bg-[#5e0710] hover:text-white font-bold py-4 rounded-2xl transition-all uppercase tracking-widest text-sm"
                  >
                     Copiar al Portapapeles
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
