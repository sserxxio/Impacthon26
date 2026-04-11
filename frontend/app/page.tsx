"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { useSidebar } from "./context/SidebarContext";
import MarkdownRenderer from "./components/MarkdownRenderer";

interface OracleResult {
  nombre: string;
  descripcion: string;
  estrategia: string;
  coste: string;
  tiempo: string;
  targeting: string;
  roi: string;
  tipo: string;
  id?: string;
}

export default function Home() {
  const [hotelName, setHotelName] = useState<string | null>(null);
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [results, setResults] = useState<OracleResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<OracleResult | null>(null);
  const [promptText, setPromptText] = useState("");
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const currentProcessId = useRef(0);
  const router = useRouter();
  const hasAutoRun = useRef(false);
  const { isOpen } = useSidebar();

  useEffect(() => {
    const storedHotelId = localStorage.getItem("hotelId");
    const storedHotelName = localStorage.getItem("hotelName");
    const storedSessions = localStorage.getItem("saved_sessions");
    
    if (!storedHotelId) { router.push("/login"); return; }
    
    const parsedId = parseInt(storedHotelId);
    setHotelId(parsedId);
    setHotelName(storedHotelName || "Hotel");

    if (storedSessions) {
      setSavedSessions(JSON.parse(storedSessions));
    }

    if (!hasAutoRun.current) {
      hasAutoRun.current = true;
      ejecutarAnalisisCompleto(parsedId, storedHotelName || "Hotel");
    }
  }, [router]);

  const ejecutarAnalisisCompleto = async (overrideHotelId?: number, overrideHotelName?: string) => {
    const pid = Date.now();
    currentProcessId.current = pid;
    setLoading(true);
    setResults([]);

    const currentHotelId = overrideHotelId || hotelId;
    const currentHotelName = overrideHotelName || hotelName;

    const prompts = [
      {
        t: "Estrategia Maestra",
        p: "Foco: REVENUE INTEGRAL. Genera una táctica maestra que fusione maximización de ADR a corto plazo y mejora de reputación digital mediante optimizaciones operativas y de marketing directo."
      }
    ];

    try {
      for (const item of prompts) {
        if (currentProcessId.current !== pid) break;

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: item.p,
            hotelId: currentHotelId,
            tipo: item.t,
            datosHotel: { nombre: currentHotelName }
          }),
        });
        const result = await res.json();

        if (currentProcessId.current !== pid) break;
        setResults(prev => [...prev, { ...result, tipo: item.t }]);

        // Retraso artificial de 4 segundos para evitar que Google Gemini bloquee
        // por ráfaga de peticiones (Rate Limit 429) en el plan gratuito.
        await new Promise(r => setTimeout(r, 4000));
      }
    } catch (e) {
      console.error("Error cargando estrategias");
    } finally {
      if (currentProcessId.current === pid) {
        setLoading(false);
      }
    }
  };

  const iniciarEstrategia = (res: OracleResult) => {
    // Generar un ID único simple basado en el timestamp
    const sessionId = Date.now().toString();
    res.id = sessionId; 
    
    // Guardar los datos de esta estrategia concreta
    localStorage.setItem(`strategy_${sessionId}`, JSON.stringify(res));
    
    // Añadir al índice de "Sesiones Guardadas"
    const saved = JSON.parse(localStorage.getItem('saved_sessions') || '[]');
    const newSession = { 
      id: sessionId, 
      nombre: res.nombre, 
      tipo: res.tipo,
      fecha: new Date().toLocaleDateString()
    };
    saved.push(newSession);
    localStorage.setItem('saved_sessions', JSON.stringify(saved));
    setSavedSessions(saved);

    router.push(`/strategy/${sessionId}`);
  };

  const ejecutarConsultaCustom = async () => {
    if (!promptText.trim()) return;

    const pid = Date.now();
    currentProcessId.current = pid; // Detiene cualquier bucle de 4-cajas en curso
    setLoading(true);
    setResults([]); // Borrar cajas anteriores

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          hotelId: hotelId,
          tipo: "Estrategia Custom",
          datosHotel: { nombre: hotelName }
        }),
      });
      const result = await res.json();

      if (currentProcessId.current === pid) {
        setResults([{ ...result, tipo: "Estrategia Custom" }]);
      }
    } catch (e) {
      console.error("Error en consulta custom");
    } finally {
      if (currentProcessId.current === pid) {
        setLoading(false);
        setPromptText("");
      }
    }
  };

  if (!hotelId) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <main className="flex-1 overflow-y-auto relative scroll-smooth">
          <div className="max-w-4xl mx-auto p-4 md:p-8">
            <Header hotelName={hotelName} />

            {results.length === 0 && !loading && (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center animate-pulse">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-blue-400 font-mono tracking-widest text-sm">INICIALIZANDO SISTEMA VELVET...</p>
                </div>
              </div>
            )}

            {loading && results.length < 1 && (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center animate-pulse">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-blue-400 font-mono tracking-widest text-sm">GENERANDO ESTRATEGIA PRINCIPAL...</p>
                </div>
              </div>
            )}

            {/* Grid de Resultados */}
            {results.length > 0 && (
              <div className="flex flex-col items-center w-full gap-6 pb-10">
                {!loading && (
                  <div className="w-full text-center animate-pulse mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-300 italic opacity-90 drop-shadow-lg">
                      Aquí tienes tu estrategia integral
                    </h2>
                  </div>
                )}
                <div className="grid grid-cols-1 w-full gap-6">
                  {results.map((res, i) => (
                    <div
                      key={i}
                      onClick={() => setSelected(res)}
                      className="cursor-pointer bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl hover:border-blue-500/50 hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between shadow-xl group relative min-h-[16rem]"
                    >
                      <div>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full mb-3 inline-block uppercase ${res.tipo.includes("Estrategia") ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}>
                          {res.tipo}
                        </span>
                        <h2 className="font-bold text-xl text-white group-hover:text-blue-400 leading-tight uppercase italic mb-2">{res.nombre}</h2>
                        <p className="text-sm text-slate-400 line-clamp-2">{res.descripcion}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); iniciarEstrategia(res); }}
                        className="mt-6 w-full bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white font-bold py-3 rounded-xl transition-all text-sm uppercase tracking-wide border border-blue-500/20 hover:border-blue-500"
                      >
                        🚀 Comenzar Estrategia
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Popup / Modal */}
          {selected && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative max-h-[90vh] flex flex-col">
                <button onClick={() => setSelected(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white text-2xl transition-colors z-20">✕</button>
                
                <div className="overflow-y-auto pr-4 custom-scrollbar">
                  <span className="text-blue-500 font-mono text-xs font-bold uppercase tracking-[0.3em]">{selected.tipo}</span>
                  <h2 className="text-3xl md:text-5xl font-black mb-8 italic uppercase leading-none tracking-tighter">{selected.nombre}</h2>

                  <div className="space-y-10">
                    <section>
                      <h3 className="text-slate-500 text-[10px] font-bold uppercase mb-3 tracking-widest border-l-2 border-blue-500 pl-3">Hoja de Ruta</h3>
                      <MarkdownRenderer content={selected.estrategia} />
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                        <h3 className="text-orange-400 text-[10px] font-bold uppercase mb-2 tracking-widest">Presupuesto Estimado</h3>
                        <p className="text-3xl font-black text-white">{selected.coste}</p>
                      </div>
                      <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                        <h3 className="text-emerald-400 text-[10px] font-bold uppercase mb-2 tracking-widest">Plazo de Implementación</h3>
                        <p className="text-3xl font-black text-white">{selected.tiempo}</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-blue-600/5 p-8 rounded-3xl border border-blue-500/20 gap-6">
                      <div>
                        <h3 className="text-blue-400 text-[10px] font-bold uppercase mb-1 tracking-widest">ROI Proyectado</h3>
                        <p className="text-5xl font-black text-blue-500">{selected.roi}</p>
                      </div>
                      <div className="md:text-right">
                        <h3 className="text-slate-500 text-[10px] font-bold uppercase mb-1 tracking-widest">Target de Mercado</h3>
                        <p className="text-lg text-slate-300 font-medium max-w-sm">{selected.targeting}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => iniciarEstrategia(selected)}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-blue-500/20 uppercase tracking-[0.2em] text-xl hover:scale-[1.02] active:scale-[0.98]"
                    >
                      🚀 Iniciar esta Estrategia
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Input Area - Non-fixed, within flex container */}
        <div className="w-full bg-slate-950/50 backdrop-blur-xl border-t border-slate-800/60 p-6 shrink-0 z-10">
          <div className="max-w-4xl mx-auto flex gap-4 items-center">
            <div className="flex-1 relative group">
              <input
                type="text"
                placeholder="Pide una estrategia personalizada para tu hotel... (ej. 'Evento corporativo en invierno')"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") ejecutarConsultaCustom();
                }}
                className="w-full bg-slate-900/80 border border-slate-700/50 rounded-2xl px-6 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-inner"
              />
              <div className="absolute inset-0 rounded-2xl bg-blue-500/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity"></div>
            </div>
            <button
              onClick={ejecutarConsultaCustom}
              disabled={!promptText.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-14 h-14 rounded-2xl flex shrink-0 items-center justify-center font-black transition-all shadow-lg shadow-blue-500/20 text-white text-xl hover:scale-105 active:scale-95"
              title="Recibir consejo instantáneo"
            >
              ⚡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}